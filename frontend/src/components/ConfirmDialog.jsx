import { useState, useEffect } from 'react';
import { AlertTriangle, X, Check } from 'lucide-react';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning' // warning, danger, info
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const typeStyles = {
    warning: {
      icon: 'bg-warning-100',
      iconColor: 'text-warning-600',
      button: 'btn-warning',
    },
    danger: {
      icon: 'bg-danger-100',
      iconColor: 'text-danger-600',
      button: 'bg-danger-500 hover:bg-danger-600 text-white',
    },
    info: {
      icon: 'bg-info-100',
      iconColor: 'text-info-600',
      button: 'bg-info-500 hover:bg-info-600 text-white',
    },
  };

  const styles = typeStyles[type] || typeStyles.warning;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className={`relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6 transform transition-all ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        {/* Icon */}
        <div className={`w-12 h-12 rounded-full ${styles.icon} flex items-center justify-center mx-auto mb-4`}>
          <AlertTriangle className={`w-6 h-6 ${styles.iconColor}`} />
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">{title}</h3>
          <p className="text-neutral-600">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${styles.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

