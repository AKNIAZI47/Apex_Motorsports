import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Handle benign sandbox websocket & network disconnects gracefully
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = typeof reason === 'string' ? reason : reason?.message || '';
    if (
      msg.includes('WebSocket closed without opened') ||
      msg.includes('failed to connect to websocket') ||
      msg.includes('ResizeObserver loop') ||
      msg.includes('Failed to fetch')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    if (
      msg.includes('WebSocket') ||
      msg.includes('ResizeObserver') ||
      msg.includes('Script error.')
    ) {
      event.preventDefault();
    }
  });
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

