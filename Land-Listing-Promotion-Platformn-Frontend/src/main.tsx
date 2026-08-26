import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { CurrencyProvider } from '@/context/CurrencyContext'
import './index.css'
import './i18n'
import App from './App'

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("L'élément racine #root n'a pas été trouvé dans le document HTML.");
}

createRoot(rootElement).render(
  <StrictMode>
    <HelmetProvider>
      <CurrencyProvider>
        <div className="font-sans antialiased text-slate-900 selection:bg-brand-primary/10">
          <App />
        </div>
      </CurrencyProvider>
    </HelmetProvider>
  </StrictMode>,
)
