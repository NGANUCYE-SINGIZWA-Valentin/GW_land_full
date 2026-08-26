// ─────────────────────────────────────────────────────────────────────────────
// CHATBOT ENGINE
// Handles response logic. Separated from UI so you can swap in an AI provider
// (OpenAI, Gemini, etc.) later without touching the UI layer.
//
// To connect a real AI:
//   1. Replace `getStaticResponse` with an async API call.
//   2. Keep the same `ChatEngineResponse` return shape.
// ─────────────────────────────────────────────────────────────────────────────

import {
  FAQ_ENTRIES,
  FALLBACK_MESSAGE,
  PAGE_CONTEXTS,
  type FaqEntry,
  type PageContext,
} from './chatbot.knowledge';

export interface ChatEngineResponse {
  answer: string;
  link?: { label: string; href: string };
}

/** Normalize text for matching */
const normalize = (text: string) => text.toLowerCase().trim();

/** Score a FAQ entry against the user query */
const scoreEntry = (entry: FaqEntry, query: string): number => {
  const q = normalize(query);
  let score = 0;
  for (const keyword of entry.keywords) {
    if (q.includes(normalize(keyword))) {
      // Longer keyword matches score higher
      score += keyword.length;
    }
  }
  return score;
};

/** Get page context description for the current path */
export const getPageContext = (pathname: string): PageContext | undefined => {
  // Exact match first, then prefix match
  return (
    PAGE_CONTEXTS.find(p => p.path === pathname) ??
    PAGE_CONTEXTS.find(p => pathname.startsWith(p.path) && p.path !== '/')
  );
};

/**
 * Static FAQ-based response engine.
 * Replace this function body with an async AI call to upgrade to full AI.
 */
export const getStaticResponse = (
  query: string,
  pathname: string
): ChatEngineResponse => {
  const q = normalize(query);

  // ── Page context questions ──
  if (
    q.includes('this page') ||
    q.includes('where am i') ||
    q.includes('current page') ||
    q.includes('what page')
  ) {
    const ctx = getPageContext(pathname);
    if (ctx) {
      return { answer: `📍 ${ctx.description}` };
    }
  }

  // ── Score all FAQ entries ──
  const scored = FAQ_ENTRIES.map(entry => ({
    entry,
    score: scoreEntry(entry, query),
  })).filter(s => s.score > 0);

  if (scored.length === 0) {
    return { answer: FALLBACK_MESSAGE };
  }

  // Return the highest scoring entry
  scored.sort((a, b) => b.score - a.score);
  const best = scored[0].entry;
  return { answer: best.answer, link: best.link };
};

/**
 * Main entry point — async so it can be swapped for an AI API call.
 *
 * Future AI integration example:
 * export const getChatResponse = async (query, pathname) => {
 *   const res = await openai.chat.completions.create({ ... });
 *   return { answer: res.choices[0].message.content };
 * };
 */
export const getChatResponse = async (
  query: string,
  pathname: string
): Promise<ChatEngineResponse> => {
  // Simulate a small network delay for realistic UX
  await new Promise(resolve => setTimeout(resolve, 600));
  return getStaticResponse(query, pathname);
};
