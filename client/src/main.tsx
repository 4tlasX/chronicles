import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
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
