import React from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from 'antd';
import 'antd/dist/reset.css';
import App from './App';
import '../index.css';

const container = document.getElementById('app');
if (container) {
  createRoot(container).render(
    <React.StrictMode>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#0f766e',
            borderRadius: 8,
          },
        }}
      >
        <App />
      </ConfigProvider>
    </React.StrictMode>,
  );
}