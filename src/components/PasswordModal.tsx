import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X, Eye, EyeOff } from 'lucide-react';
import '../App.css'; // Reusing main styles for consistency

interface PasswordModalProps {
  isOpen: boolean;
  mode: 'export' | 'import';
  onConfirm: (password: string) => void;
  onCancel: () => void;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({ 
  isOpen, 
  mode, 
  onConfirm, 
  onCancel 
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');

      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      onConfirm(password);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        style={{ zIndex: 1100 }} // Higher than SettingsModal
      >
        <motion.div 
          className="modal-container password-modal"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <div className="modal-title">
              <Lock className="text-primary" size={24} />
              <span>{mode === 'export' ? 'Proteger Backup' : 'Desbloquear Backup'}</span>
            </div>
            <button className="icon-button" onClick={onCancel}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="modal-body">
            <p className="modal-description">
              {mode === 'export' 
                ? 'Defina uma senha segura para criptografar seu arquivo de backup e proteger suas chaves de API.' 
                : 'Este backup é protegido. Digite a senha para descriptografar e restaurar seus dados.'}
            </p>

            <div className="input-group">
              <label>Senha</label>
              <div className="password-input-wrapper" style={{ position: 'relative' }}>
                <input
                  ref={inputRef}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'export' ? "Crie uma senha..." : "Digite a senha..."}
                  className="full-width"
                  autoFocus
                />
                <button 
                  type="button"
                  className="icon-button toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ 
                    position: 'absolute', 
                    right: '10px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'inherit'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" className="secondary-button" onClick={onCancel}>
                Cancelar
              </button>
              <button 
                type="submit" 
                className="primary-button" 
                disabled={!password.trim()}
              >
                {mode === 'export' ? 'Criptografar e Salvar' : 'Desbloquear e Importar'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

