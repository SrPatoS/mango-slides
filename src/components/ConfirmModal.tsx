import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'success' | 'danger';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal = ({
  isOpen,
  title,
  message,
  type = 'info',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel
}: ConfirmModalProps) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={48} color="#10b981" />;
      case 'warning':
        return <AlertCircle size={48} color="#f59e0b" />;
      case 'danger':
        return <AlertCircle size={48} color="#ef4444" />;
      default:
        return <Info size={48} color="#3b82f6" />;
    }
  };

  const getConfirmButtonStyle = () => {
    switch (type) {
      case 'success':
        return { background: '#10b981', borderColor: '#10b981' };
      case 'warning':
        return { background: '#f59e0b', borderColor: '#f59e0b' };
      case 'danger':
        return { background: '#ef4444', borderColor: '#ef4444' };
      default:
        return { background: 'var(--accent)', borderColor: 'var(--accent)' };
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
              zIndex: 9998,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                background: 'var(--bg-sidebar)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '32px',
                maxWidth: '480px',
                width: '90%',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
            {/* Close button */}
            <button
              onClick={onCancel}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'var(--bg-main)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <X size={20} />
            </button>

            {/* Icon */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              {getIcon()}
            </div>

            {/* Title */}
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '12px',
              textAlign: 'center',
              fontFamily: 'Outfit, sans-serif'
            }}>
              {title}
            </h2>

            {/* Message */}
            <p style={{
              fontSize: '1rem',
              color: 'var(--text-secondary)',
              marginBottom: '32px',
              textAlign: 'center',
              lineHeight: 1.6
            }}>
              {message}
            </p>

            {/* Actions */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              <button
                onClick={onCancel}
                style={{
                  flex: 1,
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'var(--text-secondary)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                style={{
                  flex: 1,
                  ...getConfirmButtonStyle(),
                  border: '1px solid',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  color: 'white',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

