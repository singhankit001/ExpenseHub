import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

import { GoogleOAuthProvider } from '@react-oauth/google';

const container = document.getElementById('app');
if (!container) {
  throw new Error('Failed to find the root element "#app"');
}

// Replace this with a real Client ID in production
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-client-id.apps.googleusercontent.com';

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
