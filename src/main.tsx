import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './lib/i18n';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <React.Suspense fallback={<div style={{padding: '20px', textAlign: 'center'}}>Đang tải giao diện / Loading...</div>}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.Suspense>
  </StrictMode>,
);
