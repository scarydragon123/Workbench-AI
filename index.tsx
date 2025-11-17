
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { InventoryProvider } from './context.tsx';
import { AuthProvider } from './auth.tsx';
import { ThemeProvider } from './ThemeContext.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <InventoryProvider>
          <App />
        </InventoryProvider>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);