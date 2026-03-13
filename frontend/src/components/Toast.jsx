import { useState, useEffect, createContext, useContext } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info, Bell } from 'lucide-react';

// Toast Context
const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const toast = {
    success: (message) => addToast(message, 'success'),
    error: (message) => addToast(message, 'error'),
    warning: (message) => addToast(message, 'warning'),
    info: (message) => addToast(message, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, onRemove }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'error': return <AlertCircle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = (type) => {
    const base = 'flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg min-w-[320px] max-w-md';
    switch (type) {
      case 'success': 
        return `${base} bg-gradient-to-r from-success-500 to-green-600 text-white`;
      case 'error': 
        return `${base} bg-gradient-to-r from-danger-500 to-red-600 text-white`;
      case 'warning': 
        return `${base} bg-gradient-to-r from-warning-500 to-orange-500 text-white`;
      default: 
        return `${base} bg-gradient-to-r from-primary-500 to-secondary-500 text-white`;
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className={`${getStyles(toast.type)} animate-slide-in-right`}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex-shrink-0">
            {getIcon(toast.type)}
          </div>
          <p className="flex-1 text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => onRemove(toast.id)}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

// Add this style to index.css if not already present
// @keyframes slideInRight {
//   from {
//     opacity: 0;
//     transform: translateX(100%);
//   }
//   to {
//     opacity: 1;
//     transform: translateX(0);
//   }
// }

export default ToastProvider;

