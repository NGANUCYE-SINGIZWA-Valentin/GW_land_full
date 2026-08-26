// src/utils/slug.js
//
// Generates clean URLs like /listings/kigali-gasabo-500sqm (PRD 4.4 #24).
// If that exact slug is already taken, we append -1, -2, etc.

const slugify = require('slugify');

async function generateUniqueSlug(pool, { district, sector, size_value, size_unit }) {
  const base = slugify(`${district}-${sector}-${size_value}${size_unit}`, {
    lower: true,
    strict: true, // strips anything that isn't a letter, number, or hyphen
  });

  let slug = base;
  let counter = 1;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await pool.query('SELECT id FROM listings WHERE slug = $1', [slug]);
    if (existing.rows.length === 0) return slug;
    slug = `${base}-${counter}`;
    counter += 1;
  }
}

module.exports = { generateUniqueSlug };
