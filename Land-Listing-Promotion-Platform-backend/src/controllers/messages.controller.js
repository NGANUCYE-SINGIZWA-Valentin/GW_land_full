// src/controllers/messages.controller.js
// In-platform messaging between buyers and sellers (PRD section 7, 5.3 #34).
// A "conversation" in this system is the combination of a listing + two users.
// Messages are threaded per listing so sellers can track which property a
// buyer is asking about.

const pool = require('../config/db');
const { sendEmail } = require('../utils/email');

// POST /api/messages
// Any logged-in user can send a message about a listing.
// body: { listing_id, receiver_id, body }
async function sendMessage(req, res) {
  try {
    const { listing_id, receiver_id, body } = req.body;

    if (!receiver_id || !body) {
      return res.status(400).json({ error: 'receiver_id and body are required' });
    }
    if (!body.trim()) {
      return res.status(400).json({ error: 'Message body cannot be empty' });
    }
    if (receiver_id === req.user.id) {
      return res.status(400).json({ error: 'You cannot send a message to yourself' });
    }

    // Fetch listing info if provided
    let listingTitle = null;
    if (listing_id) {
      const listing = await pool.query(
        "SELECT id, title FROM listings WHERE id = $1 AND status = 'approved'",
        [listing_id]
      );
      if (listing.rows.length === 0) {
        return res.status(404).json({ error: 'Listing not found or not yet approved' });
      }
      listingTitle = listing.rows[0].title;
    }

    // Verify the receiver exists and get their email
    const receiverResult = await pool.query(
      'SELECT id, full_name, email FROM users WHERE id = $1',
      [receiver_id]
    );
    if (receiverResult.rows.length === 0) {
      return res.status(404).json({ error: 'Recipient not found' });
    }
    const receiverUser = receiverResult.rows[0];

    // Get sender's name
    const senderResult = await pool.query(
      'SELECT full_name, email FROM users WHERE id = $1',
      [req.user.id]
    );
    const senderUser = senderResult.rows[0];

    const result = await pool.query(
      `INSERT INTO messages (listing_id, sender_id, receiver_id, body)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [listing_id || null, req.user.id, receiver_id, body.trim()]
    );

    // ── Email Confirmations ──────────────────────────────────────────────────
    // 1. Confirm to sender (buyer) that their message was received
    const senderSubject = listingTitle
      ? `Your inquiry about "${listingTitle}" has been sent`
      : 'Your message has been sent — GW Homes';

    sendEmail({
      to: senderUser.email,
      subject: senderSubject,
      text: `Hi ${senderUser.full_name},\n\nThank you for reaching out! Your message has been delivered to the seller.\n\nYour message:\n"${body.trim()}"\n\nThe seller will reply shortly. You can view your conversation in your GW Homes dashboard.\n\n— The GW Homes Team`,
    }).catch(err => console.warn('[email] Sender confirmation failed silently:', err.message));

    // 2. Notify the seller (receiver) that they have a new message
    const receiverSubject = listingTitle
      ? `New inquiry about your listing: "${listingTitle}"`
      : `New message from ${senderUser.full_name}`;

    sendEmail({
      to: receiverUser.email,
      subject: receiverSubject,
      text: `Hi ${receiverUser.full_name},\n\nYou have a new message from ${senderUser.full_name}!\n\n${listingTitle ? `Regarding: ${listingTitle}\n\n` : ''}Message:\n"${body.trim()}"\n\nLog in to your GW Homes dashboard to reply.\n\n— The GW Homes Team`,
    }).catch(err => console.warn('[email] Receiver notification failed silently:', err.message));

    res.status(201).json({ message: result.rows[0] });
  } catch (err) {
    console.error('sendMessage error:', err.message);
    res.status(500).json({ error: 'Something went wrong while sending the message' });
  }
}


// GET /api/messages/inbox
// Returns all conversations the logged-in user is part of,
// grouped by the other party + listing, showing the latest message.
// Used to build the message inbox in the seller/buyer dashboard.
async function getInbox(req, res) {
  try {
    const result = await pool.query(
      `SELECT DISTINCT ON (
           LEAST(m.sender_id::text, m.receiver_id::text),
           COALESCE(m.listing_id::text, 'no-listing')
         )
         m.id, m.listing_id, m.body, m.is_read, m.created_at,
         m.sender_id, m.receiver_id,
         sender.full_name AS sender_name,
         receiver.full_name AS receiver_name,
         l.title AS listing_title, l.slug AS listing_slug,
         (SELECT COUNT(*) FROM messages unread
          WHERE unread.receiver_id = $1 AND unread.is_read = false
            AND COALESCE(unread.listing_id::text,'') = COALESCE(m.listing_id::text,'')
            AND unread.sender_id = CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END
         ) AS unread_count
       FROM messages m
       JOIN users sender   ON m.sender_id   = sender.id
       JOIN users receiver ON m.receiver_id = receiver.id
       LEFT JOIN listings l ON m.listing_id = l.id
       WHERE m.sender_id = $1 OR m.receiver_id = $1
       ORDER BY
         LEAST(m.sender_id::text, m.receiver_id::text),
         COALESCE(m.listing_id::text, 'no-listing'),
         m.created_at DESC`,
      [req.user.id]
    );

    res.json({ conversations: result.rows });
  } catch (err) {
    console.error('getInbox error:', err.message);
    res.status(500).json({ error: 'Something went wrong while fetching your inbox' });
  }
}

// GET /api/messages/thread/:other_user_id?listing_id=xxx
// Returns the full message thread between the logged-in user and another user
// (optionally filtered to a specific listing). Marks all messages in the thread
// as read.
async function getThread(req, res) {
  try {
    const { other_user_id } = req.params;
    const { listing_id } = req.query;

    const conditions = [
      `((m.sender_id = $1 AND m.receiver_id = $2) OR (m.sender_id = $2 AND m.receiver_id = $1))`
    ];
    const params = [req.user.id, other_user_id];

    if (listing_id) {
      params.push(listing_id);
      conditions.push(`m.listing_id = $${params.length}`);
    }

    const result = await pool.query(
      `SELECT m.*, u.full_name AS sender_name
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE ${conditions.join(' AND ')}
       ORDER BY m.created_at ASC`,
      params
    );

    // Mark everything the other user sent to us as read
    await pool.query(
      `UPDATE messages SET is_read = true
       WHERE receiver_id = $1 AND sender_id = $2
         AND is_read = false
         ${listing_id ? 'AND listing_id = $3' : ''}`,
      listing_id ? [req.user.id, other_user_id, listing_id] : [req.user.id, other_user_id]
    );

    res.json({ messages: result.rows });
  } catch (err) {
    console.error('getThread error:', err.message);
    res.status(500).json({ error: 'Something went wrong while fetching the thread' });
  }
}

// GET /api/messages/unread-count
// Quick count for the notification badge in the dashboard header.
async function getUnreadCount(req, res) {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) FROM messages WHERE receiver_id = $1 AND is_read = false',
      [req.user.id]
    );
    res.json({ unread_count: parseInt(result.rows[0].count) });
  } catch (err) {
    console.error('getUnreadCount error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

module.exports = { sendMessage, getInbox, getThread, getUnreadCount };
