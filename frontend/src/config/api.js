// Automatically detect if running locally or deployed in cloud
const isBrowser = typeof window !== 'undefined';
const isLocal = isBrowser && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname === '0.0.0.0'
);

const DEFAULT_BACKEND_URL = isLocal 
  ? 'http://127.0.0.1:8000' 
  : 'https://cyclone-pattern-identifier-1.onrender.com';

export const API_BASE_URL = (import.meta.env.VITE_API_URL || DEFAULT_BACKEND_URL).replace(/\/$/, '');

