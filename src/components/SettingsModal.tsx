import { useState } from "react";
import { X, Cpu, Database, Info, Trash2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  geminiKey: string;
  setGeminiKey: (key: string) => void;
  geminiEnabled: boolean;
  setGeminiEnabled: (enabled: boolean) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  onSave: () => void;
  onResetDatabase?: () => void;
}

type SettingsTab = 'ai' | 'data' | 'about';

export const SettingsModal = ({
  isOpen,
  onClose,
  geminiKey,
  setGeminiKey,
  geminiEnabled,
  setGeminiEnabled,
  selectedModel,
  setSelectedModel,
  onSave,
  onResetDatabase
}: SettingsModalProps) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('ai');

  if (!isOpen) return null;

  const tabs = [
    { id: 'ai' as SettingsTab, icon: Cpu, label: 'Inteligência Artificial' },
    { id: 'data' as SettingsTab, icon: Database, label: 'Dados' },
    { id: 'about' as SettingsTab, icon: Info, label: 'Sobre' }
  ];

  const models = [
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Rápido e eficiente' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Mais poderoso e preciso' },
    { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash (Experimental)', description: 'Última versão experimental' }
  ];

  return (
    <AnimatePresence>
      <div className="settings-overlay" onClick={onClose}>
        <motion.div 
          className="settings-modal-new" 
          onClick={e => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
        >
          {/* Header */}
          <div className="settings-header">
            <h2>Configurações</h2>
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          {/* Body with Sidebar */}
          <div className="settings-body">
            {/* Sidebar */}
            <div className="settings-sidebar">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <tab.icon size={20} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="settings-content-area">
              {activeTab === 'ai' && (
                <div className="settings-section">
                  <h3>Inteligência Artificial</h3>
                  <p className="section-description">
                    Configure a integração com Google Gemini AI para geração automática de slides.
                  </p>

                  <div className="settings-card">
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
                      <div className="input-group">
                        <label>API Key</label>
                        <input 
                          type="password" 
                          placeholder="Cole sua API Key do Google AI Studio..."
                          value={geminiKey}
                          onChange={(e) => setGeminiKey(e.target.value)}
                        />
                        <small>Obtenha sua chave em <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a></small>
                      </div>

                      <div className="input-group">
                        <label>Modelo</label>
                        <div className="model-list">
                          {models.map(model => (
                            <div
                              key={model.id}
                              className={`model-option ${selectedModel === model.id ? 'selected' : ''}`}
                              onClick={() => setSelectedModel(model.id)}
                            >
                              <div className="model-radio">
                                <div className="radio-dot"></div>
                              </div>
                              <div className="model-info">
                                <div className="model-name">{model.name}</div>
                                <div className="model-description">{model.description}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'data' && (
                <div className="settings-section">
                  <h3>Gerenciamento de Dados</h3>
                  <p className="section-description">
                    Gerencie seus dados e configurações do aplicativo.
                  </p>

                  <div className="settings-card danger-card">
                    <div className="card-header">
                      <div className="card-title">
                        <AlertTriangle size={20} color="#ef4444" />
                        <span>Zona de Perigo</span>
                      </div>
                    </div>
                    
                    <div className="card-body active">
                      <p>Resetar o banco de dados irá <strong>excluir permanentemente</strong> todos os seus projetos, slides e configurações. Esta ação não pode ser desfeita.</p>
                      
                      <button 
                        className="danger-button"
                        onClick={onResetDatabase}
                      >
                        <Trash2 size={18} />
                        Resetar Banco de Dados
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'about' && (
                <div className="settings-section">
                  <h3>Sobre o MangoSlides</h3>
                  <p className="section-description">
                    Informações sobre o aplicativo.
                  </p>

                  <div className="settings-card">
                    <div className="card-body active">
                      <div className="about-info">
                        <div className="app-logo">
                          <div className="logo-icon-large">MS</div>
                        </div>
                        <h4>MangoSlides Designer</h4>
                        <p className="version">Versão 1.0.0</p>
                        <p className="description">
                          Editor de apresentações moderno com geração de conteúdo por IA.
                        </p>
                        <div className="tech-stack">
                          <span className="tech-badge">React</span>
                          <span className="tech-badge">TypeScript</span>
                          <span className="tech-badge">Tauri</span>
                          <span className="tech-badge">Gemini AI</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="settings-footer">
            <button className="cancel-btn" onClick={onClose}>
              Cancelar
            </button>
            <button className="save-btn" onClick={() => { onSave(); onClose(); }}>
              Salvar Alterações
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
