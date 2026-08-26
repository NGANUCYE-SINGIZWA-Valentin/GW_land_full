import { apiRequest } from './client';
import type { Conversation, Message } from './types';

export function sendMessage(payload: { receiver_id: string; body: string; listing_id?: string }) {
  return apiRequest<{ message: Message }>('/messages', { method: 'POST', auth: true, body: payload });
}

export function getInbox() {
  return apiRequest<{ conversations: Conversation[] }>('/messages/inbox', { auth: true });
}

export function getUnreadCount() {
  return apiRequest<{ unread_count: number }>('/messages/unread-count', { auth: true });
}

export function getThread(otherUserId: string, listingId?: string) {
  return apiRequest<{ messages: Message[] }>(`/messages/thread/${otherUserId}`, {
    auth: true,
    query: { listing_id: listingId },
  });
}
