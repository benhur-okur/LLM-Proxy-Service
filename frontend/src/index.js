import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext';  // AuthProvider import et

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>  {/* AuthProvider ile App'i sar */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);
