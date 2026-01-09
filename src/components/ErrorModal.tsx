import React from "react";
import { X, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorDetails: string | null;
}

export const ErrorModal = ({ isOpen, onClose, errorDetails }: ErrorModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <motion.div 
        className="settings-modal" 
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        style={{ maxWidth: '550px' }}
      >
        <div className="settings-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertCircle size={24} className="error-icon" />
            <h2 style={{ fontSize: '1.2rem', color: '#ef4444' }}>Erro na Geração</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="settings-content">
          <div className="error-container">
            <p style={{ fontWeight: 600 }}>Ocorreu um problema ao tentar gerar os slides:</p>
            <div className="error-details">
              {errorDetails}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Verifique se sua API Key está correta e se você possui cota disponível no Google AI Studio.
            </p>
          </div>
        </div>

        <div className="settings-footer">
          <button className="btn-danger" onClick={onClose}>
            Entendi
          </button>
        </div>
      </motion.div>
    </div>
  );
};
