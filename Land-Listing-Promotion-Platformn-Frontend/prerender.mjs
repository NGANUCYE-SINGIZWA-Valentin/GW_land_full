/**
 * Script de pré-rendu statique (SSG) pour GWLand.
 * Utilise Vite SSR + React 19 pour générer du HTML statique.
 * Aucune dépendance supplémentaire — utilise uniquement Vite et React déjà installés.
 *
 * Usage : node prerender.mjs
 * (s'exécute automatiquement après `vite build` via le script "build" dans package.json)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, 'dist');

// Routes statiques à pré-rendre
// Note: /properties est exclu car il utilise Leaflet (carte interactive)
// qui dépend de `window` et ne peut pas être pré-rendu sans mock complexe.
// Le SEO reste fonctionnel sur /properties via react-helmet-async au runtime.
const ROUTES = [
  { path: '/', output: 'index.html' },
  { path: '/about', output: 'about/index.html' },
  { path: '/contact', output: 'contact/index.html' },
  { path: '/privacy-policy', output: 'privacy-policy/index.html' },
  { path: '/terms-conditions', output: 'terms-conditions/index.html' },
];

async function prerender() {
  console.log('🔧 Démarrage du pré-rendu statique...\n');

  // Polyfill des globals navigateur nécessaires à Leaflet/React en SSR
  // (Leaflet accède à window, document, navigator dès l'import)
  // Note: navigator et location sont read-only dans Node, on utilise Object.defineProperty
  globalThis.window = globalThis;
  globalThis.document = {
    createElement: () => ({}),
    createElementNS: () => ({}),
    documentElement: { style: {} },
    querySelector: () => null,
    getElementById: () => null,
  };
  Object.defineProperty(globalThis, 'navigator', {
    value: { userAgent: 'node' },
    writable: false,
    configurable: true,
  });
  Object.defineProperty(globalThis, 'location', {
    value: { href: '', origin: '', protocol: 'https:', host: '', pathname: '' },
    writable: false,
    configurable: true,
  });
  globalThis.HTMLElement = class {};
  globalThis.SVGElement = class {};
  globalThis.Image = class {};
  globalThis.CSS = { supports: () => false };
  globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 0);
  globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
  globalThis.matchMedia = () => ({ matches: false, addListener: () => {}, removeListener: () => {} });
  globalThis.IntersectionObserver = class {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  // 1. Lire le template HTML de base généré par Vite
  const templatePath = path.resolve(DIST_DIR, 'index.html');
  if (!fs.existsSync(templatePath)) {
    console.error('❌ Template HTML introuvable. Exécutez d\'abord `vite build`.');
    process.exit(1);
  }

  const template = fs.readFileSync(templatePath, 'utf-8');

  // 2. Démarrer le serveur SSR Vite avec un plugin qui mock Leaflet
  const { createServer } = await import('vite');
  const server = await createServer({
    root: __dirname,
    server: { middlewareMode: true },
    appType: 'custom',
    plugins: [
      {
        name: 'mock-leaflet-ssr',
        resolveId(source) {
          if (source === 'leaflet' || source === 'leaflet/dist/leaflet') {
            return '\0mock-leaflet';
          }
          return null;
        },
        load(id) {
          if (id === '\0mock-leaflet') {
            return `
              const L = {
                Map: class { on() { return this; } remove() {} setView() { return this; } getCenter() { return {lat:0,lng:0}; } getZoom() { return 13; } fitBounds() { return this; } invalidateSize() { return this; } },
                TileLayer: class { addTo() { return this; } setUrl() { return this; } },
                Marker: class { addTo() { return this; } setIcon() { return this; } on() { return this; } bindPopup() { return this; } },
                Icon: class { constructor() {} },
                DivIcon: class { constructor() {} },
                Popup: class { setContent() { return this; } },
                LatLng: class { constructor(lat,lng) { this.lat=lat; this.lng=lng; } },
                LatLngBounds: class { extend() { return this; } },
                control: { zoom: () => ({addTo:()=>{}}), attribution: () => ({addTo:()=>{}}) },
                DomEvent: { on: ()=>{}, off: ()=>{}, stopPropagation: ()=>{} },
                DomUtil: { get: ()=>null, create: ()=>({}), setPosition: ()=>{}, getPosition: ()=>({x:0,y:0}) },
                Point: class { constructor(x,y) { this.x=x; this.y=y; } },
                Browser: { mobile:false, touch:false, webkit:false, ie:false, edge:false },
                Util: { extend: Object.assign, bind: (fn,...a)=>fn.bind(null,...a), stamp: ()=>0, throttle: fn=>fn, falseFn: ()=>false, formatNum: n=>n },
              };
              export default L;
              export const Map = L.Map;
              export const TileLayer = L.TileLayer;
              export const Marker = L.Marker;
              export const Icon = L.Icon;
              export const DivIcon = L.DivIcon;
              export const Popup = L.Popup;
              export const LatLng = L.LatLng;
              export const LatLngBounds = L.LatLngBounds;
              export const control = L.control;
              export const DomEvent = L.DomEvent;
              export const DomUtil = L.DomUtil;
              export const Point = L.Point;
              export const Browser = L.Browser;
              export const Util = L.Util;
            `;
          }
          return null;
        },
      },
    ],
  });

  let renderFn = null;

  try {
    // 3. Importer le module de rendu SSR
    const module = await server.ssrLoadModule('/src/entry-server.tsx');
    renderFn = module.render;
  } catch (err) {
    console.error('⚠ Impossible de charger le module SSR:', err.message);
    console.error('  Leaflet/React-leaflet bloque le SSR. Le pré-rendu est ignoré.');
    console.error('  Le SEO runtime via react-helmet-async reste fonctionnel.');
  }

  let hasError = false;

  if (renderFn) {
    for (const route of ROUTES) {
      console.log(`  → ${route.path}`);

      try {
        // Rendre la page en HTML
        const { html, headTags } = await renderFn(route.path);

        // Injecter le HTML rendu dans le template
        const renderedHtml = template
          .replace('<!--ssr-head-->', headTags || '')
          .replace('<div id="root"></div>', `<div id="root">${html}</div>`);

        // Écrire le fichier
        const outputPath = path.resolve(DIST_DIR, route.output);
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        fs.writeFileSync(outputPath, renderedHtml, 'utf-8');

        console.log(`    ✓ ${route.output}`);
      } catch (err) {
        hasError = true;
        console.error(`    ⚠ Erreur sur ${route.path}:`, err.message);
      }
    }
  }

  // 4. Nettoyage
  await server.close();

  if (hasError) {
    console.log('\n⚠ Pré-rendu terminé avec des erreurs (voir ci-dessus).');
  } else if (renderFn) {
    console.log('\n✅ Pré-rendu terminé !');
  } else {
    console.log('\n⚠ Pré-rendu sauté (SSR non disponible).');
  }
}

prerender().catch((err) => {
  console.error('❌ Erreur fatale:', err);
  process.exit(1);
});
