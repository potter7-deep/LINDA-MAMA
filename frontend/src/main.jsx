import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import App from './App';
import './index.css';

// Toast configuration
const toastOptions = {
  duration: 4000,
  position: 'top-right',
  style: {
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: '500',
  },
  success: {
    duration: 3000,
    iconTheme: {
      primary: '#22C55E',
      secondary: '#FFFFFF',
    },
  },
  error: {
    duration: 5000,
    iconTheme: {
      primary: '#EF4444',
      secondary: '#FFFFFF',
    },
  },
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <App />
          <Toaster 
            {...toastOptions}
            gutter={12}
            containerStyle={{
              top: 24,
              right: 24,
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);

