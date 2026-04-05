import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import '@fontsource/lato/400.css';
import '@fontsource/lato/700.css';
import '@fontsource/lato/400-italic.css';
import '@fontsource/montserrat/100.css';
import '@fontsource/montserrat/200.css';
import '@fontsource/montserrat/300.css';
import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/500.css';
import '@fontsource/playfair-display/600.css';
import '@fontsource/playfair-display/700.css';
import '@fontsource/playfair-display/400-italic.css';
import '@fontsource/playfair-display/500-italic.css';
import '@fontsource/josefin-sans/300.css';
import '@fontsource/josefin-sans/400.css';
import '@fontsource/josefin-sans/600.css';
import { App } from './App.js';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Register service worker for PWA (shell caching only — no encrypted data cached)
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('A new version of Chronicles is available. Reload?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('Chronicles is ready for offline use');
  },
});
