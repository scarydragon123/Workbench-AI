import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { InventoryProvider } from './context';
import { AuthProvider } from './auth';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <InventoryProvider>
        <App />
      </InventoryProvider>
    </AuthProvider>
  </React.StrictMode>
);
