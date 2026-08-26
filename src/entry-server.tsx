/**
 * Point d'entrée SSR pour le pré-rendu statique.
 * Utilisé par le script prerender.mjs pour générer du HTML côté serveur.
 *
 * Compatible react-router-dom v7+ (plus de StaticRouter, on utilise MemoryRouter)
 */
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';

interface RenderResult {
  html: string;
  headTags: string;
}

export async function render(url: string): Promise<RenderResult> {
  const helmetContext = {};

  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <MemoryRouter initialEntries={[url]}>
        <App />
      </MemoryRouter>
    </HelmetProvider>
  );

  // Extraire les balises head de react-helmet-async
  const helmet = (helmetContext as Record<string, unknown>).helmet as {
    title?: { toString(): string };
    meta?: { toString(): string };
    link?: { toString(): string };
    script?: { toString(): string };
  } | undefined;

  const headTags = helmet
    ? [
        helmet.title?.toString() || '',
        helmet.meta?.toString() || '',
        helmet.link?.toString() || '',
        helmet.script?.toString() || '',
      ].join('')
    : '';

  return { html, headTags };
}
