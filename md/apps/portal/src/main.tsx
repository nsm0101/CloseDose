import '@fontsource-variable/public-sans/wght.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('CloseDose MD portal root element was not found');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
