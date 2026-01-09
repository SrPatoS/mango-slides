import { X, Cpu } from "lucide-react";
import { motion } from "framer-motion";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  geminiKey: string;
  setGeminiKey: (key: string) => void;
  geminiEnabled: boolean;
  setGeminiEnabled: (enabled: boolean) => void;
  onSave: () => void;
}

export const SettingsModal = ({
  isOpen,
  onClose,
  geminiKey,
  setGeminiKey,
  geminiEnabled,
  setGeminiEnabled,
  onSave
}: SettingsModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <motion.div 
        className="settings-modal" 
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
      >
        <div className="settings-header">
          <h2>Configurações</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <div className="settings-card ai-config-card">
              <div className="card-header">
                <div className="card-title">
                  <Cpu size={20} />
                  <span>Google Gemini AI</span>
                </div>
                <div className="switch-group">
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={geminiEnabled}
                      onChange={(e) => setGeminiEnabled(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
              
              <div className={`card-body ${geminiEnabled ? 'active' : ''}`}>
                <p>Insira sua API Key do Google AI Studio para habilitar recursos de geração automática.</p>
                <div className="api-key-input-wrapper">
                  <input 
                    type="password" 
                    placeholder="Cole sua API Key aqui..."
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    className="api-key-input"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <button className="cancel-btn" onClick={onClose}>Cancelar</button>
          <button className="save-btn" onClick={onSave}>Salvar Alterações</button>
        </div>
      </motion.div>
    </div>
  );
};
