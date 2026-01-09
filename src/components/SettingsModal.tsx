import { useState, useEffect } from "react";
import { X, Cpu, Database, Info, Trash2, AlertTriangle, Download, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PasswordModal } from "./PasswordModal";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  geminiKey: string;
  setGeminiKey: (key: string) => void;
  geminiEnabled: boolean;
  setGeminiEnabled: (enabled: boolean) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  onResetDatabase?: () => void;
  onSave: () => Promise<void>;
}

type SettingsTab = 'ai' | 'backup' | 'data' | 'about';

export const SettingsModal = ({
  isOpen,
  onClose,
  geminiKey,
  setGeminiKey,
  geminiEnabled,
  setGeminiEnabled,
  selectedModel,
  setSelectedModel,
  onResetDatabase,
  onSave
}: SettingsModalProps) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('ai');
  const [appInfo, setAppInfo] = useState({ name: 'MangoSlides Designer', version: 'Loading...' });

  useEffect(() => {
    if (activeTab === 'about') {
      import('@tauri-apps/api/app').then(async (app) => {
        try {
          const name = await app.getName();
          const version = await app.getVersion();
          // Capitalize Name if needed or use as is. Tauri typically returns package name.
          // Let's format it nicer if it matches the default 'tauri-app' or similar, 
          // otherwise trust the API.
          setAppInfo({ 
             name: name === 'tauri-app' ? 'MangoSlides Designer' : name, 
             version 
          });
        } catch (err) {
          console.error('Failed to get app info', err);
        }
      });
    }
  }, [activeTab]);
  
  // Password Modal State
  const [passwordModal, setPasswordModal] = useState<{
    isOpen: boolean;
    mode: 'export' | 'import';
    fileToImport?: string; // Temporarily store file path/content for import flow
  }>({ isOpen: false, mode: 'export' });

  // Handle Export Flow
  const handleExport = async (password: string) => {
    try {
        const { save } = await import('@tauri-apps/plugin-dialog');
        const { writeFile } = await import('@tauri-apps/plugin-fs');
        const Database = (await import('@tauri-apps/plugin-sql')).default;
        
        // 1. Fetch DB Data
        const db = await Database.load("sqlite:slideflow.db");
        const projects = await db.select("SELECT * FROM projects");
        const secrets = await db.select("SELECT * FROM secrets"); 
        
        const rawData = JSON.stringify({
          projects,
          secrets,
          timestamp: new Date().toISOString(),
          version: 1
        });

        // 2. Encrypt
        const enc = new TextEncoder();
        const salt = window.crypto.getRandomValues(new Uint8Array(16));
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        
        const keyMaterial = await window.crypto.subtle.importKey(
            "raw", 
            enc.encode(password), 
            { name: "PBKDF2" }, 
            false, 
            ["deriveKey"]
        );
        
        const key = await window.crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: salt,
                iterations: 100000,
                hash: "SHA-256"
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            false,
            ["encrypt"]
        );

        const encryptedContent = await window.crypto.subtle.encrypt(
            { name: "AES-GCM", iv: iv },
            key,
            enc.encode(rawData)
        );

        const encryptedArray = new Uint8Array(salt.byteLength + iv.byteLength + encryptedContent.byteLength);
        encryptedArray.set(salt, 0);
        encryptedArray.set(iv, salt.byteLength);
        encryptedArray.set(new Uint8Array(encryptedContent), salt.byteLength + iv.byteLength);

        // 3. Save
        const filePath = await save({
          filters: [{
            name: 'Backup Seguro',
            extensions: ['bin']
          }],
          defaultPath: `mangoslides-secure-backup-${new Date().toISOString().split('T')[0]}.bin`
        });
        
        if (filePath) {
          await writeFile(filePath, encryptedArray);
          alert('Backup CRIPTOGRAFADO exportado com sucesso!');
        }
        setPasswordModal({ ...passwordModal, isOpen: false });

    } catch (e) {
        console.error(e);
        alert(`Erro na exportação: ${e}`);
    }
  };

  // Handle Import Flow
  const handleImport = async (password: string) => {
    if (!passwordModal.fileToImport) return;

    try {
        const { readFile } = await import('@tauri-apps/plugin-fs');
        const Database = (await import('@tauri-apps/plugin-sql')).default;

        const fileBytes = await readFile(passwordModal.fileToImport);
        let jsonString = "";

        const salt = fileBytes.slice(0, 16);
        const iv = fileBytes.slice(16, 28);
        const data = fileBytes.slice(28);
        const enc = new TextEncoder();

        const keyMaterial = await window.crypto.subtle.importKey(
          "raw", 
          enc.encode(password), 
          { name: "PBKDF2" }, 
          false, 
          ["deriveKey"]
        );
        
        const key = await window.crypto.subtle.deriveKey(
          {
              name: "PBKDF2",
              salt: salt,
              iterations: 100000,
              hash: "SHA-256"
          },
          keyMaterial,
          { name: "AES-GCM", length: 256 },
          false,
          ["decrypt"]
        );

        try {
            const decryptedContent = await window.crypto.subtle.decrypt(
              { name: "AES-GCM", iv: iv },
              key,
              data
            );
            const decoder = new TextDecoder();
            jsonString = decoder.decode(decryptedContent);
        } catch(e) {
            alert("Senha incorreta ou arquivo incompatível.");
            return; // Don't close modal on wrong password
        }

        // Proceed to restore
        const parsedData = JSON.parse(jsonString);
        await restoreDatabase(parsedData, Database);
        
        alert('Backup importado com sucesso!');
        setPasswordModal({ ...passwordModal, isOpen: false });
        onResetDatabase?.();
        window.location.reload();

    } catch(e) {
        console.error(e);
        alert(`Erro na importação: ${e}`);
    }
  };

  const restoreDatabase = async (data: any, Database: any) => {
      const db = await Database.load("sqlite:slideflow.db");
      let projectsFn = [];
      let secretsFn = [];

      if (Array.isArray(data)) {
        projectsFn = data;
      } else if (data.projects) {
        projectsFn = data.projects;
        secretsFn = data.secrets || [];
      } else {
        throw new Error("Formato de dados inválido.");
      }

      await db.execute("DELETE FROM projects");
      for (const p of projectsFn) {
        // Ensure p.data exists. If it's a legacy backup where p object structure is different, we might need to stringify slides.
        // However, based on how we export (SELECT *), p should have 'data'.
        // If p comes from a very old backup structure (plain array of objects with slides property?), we should handle it.
        
        let dataContent = p.data;
        if (!dataContent && p.slides) {
            // Converts legacy object structure to new structure if needed
            dataContent = JSON.stringify({
                slides: p.slides,
                activeTheme: p.activeTheme || 'light',
                activeFont: p.activeFont || 'sans'
            });
        }

        await db.execute(
          "INSERT INTO projects (id, name, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
          [p.id, p.name, dataContent, p.created_at, p.updated_at]
        );
      }

      if (secretsFn.length > 0) {
        await db.execute("DELETE FROM secrets");
        for (const s of secretsFn) {
          await db.execute(
            "INSERT INTO secrets (name, value) VALUES (?, ?)",
            [s.name, s.value]
          );
        }
      }
  };

  const startExport = () => {
      setPasswordModal({ isOpen: true, mode: 'export' });
  };

  const startImport = async () => {
      try {
        const { open, ask, message } = await import('@tauri-apps/plugin-dialog');
        
        const confirmed = await ask('Isso irá substituir todos os seus projetos e configurações atuais. Deseja continuar?', {
            title: 'Atenção: Substituição de Dados',
            kind: 'warning'
        });
        
        if (!confirmed) return;

        const { readFile } = await import('@tauri-apps/plugin-fs');
        const Database = (await import('@tauri-apps/plugin-sql')).default;

        const selected = await open({
            filters: [{ name: 'Backup Seguro', extensions: ['bin', 'json'] }],
            multiple: false
        });

        if (selected) {
            const path = selected as string;
            const fileBytes = await readFile(path);
            
            // Check for JSON signature (heuristic)
            const isJson = (fileBytes[0] === 123 || fileBytes[0] === 91); // '{' or '['

            if (isJson) {
                const importUnsecure = await ask("Este arquivo parece NÃO estar criptografado (backup antigo). Tem certeza que deseja importar?", {
                    title: 'Arquivo Não Seguro',
                    kind: 'info'
                });
                
                if(!importUnsecure) return;

                const decoder = new TextDecoder();
                const jsonStr = decoder.decode(fileBytes);
                const data = JSON.parse(jsonStr);
                await restoreDatabase(data, Database);
                
                await message('Backup importado com sucesso! O aplicativo será recarregado.', { title: 'Sucesso' });
                onResetDatabase?.();
                window.location.reload();
            } else {
                // Secure format -> Open password modal
                setPasswordModal({ 
                    isOpen: true, 
                    mode: 'import',
                    fileToImport: path
                });
            }
        }
      } catch (err) {
        console.error(err);
        const { message } = await import('@tauri-apps/plugin-dialog');
        await message(`Erro ao selecionar arquivo: ${err}`, { title: 'Erro', kind: 'error' });
      }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'ai' as SettingsTab, icon: Cpu, label: 'Inteligência Artificial' },
    { id: 'backup' as SettingsTab, icon: Database, label: 'Backup' },
    { id: 'data' as SettingsTab, icon: Trash2, label: 'Dados' },
    { id: 'about' as SettingsTab, icon: Info, label: 'Sobre' }
  ];

  const models = [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Rápido e eficiente' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Mais poderoso e preciso' },
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

              {activeTab === 'backup' && (
                <div className="settings-section">
                  <h3>Backup e Restauração</h3>
                  <p className="section-description">
                    Faça backup dos seus projetos ou restaure de um arquivo anterior.
                  </p>

                  <div className="settings-card">
                    <div className="card-header">
                      <div className="card-title">
                        <Download size={20} />
                        <span>Exportar Backup</span>
                      </div>
                    </div>
                    
                    <div className="card-body active">
                      <p>Baixe uma cópia de segurança criptografada de todos os seus projetos e configurações (incluindo chaves de API).</p>
                      
                      <button 
                        className="primary-button"
                        onClick={startExport}
                      >
                        <Download size={18} />
                        Exportar Backup (Criptografado)
                      </button>
                    </div>
                  </div>

                  <div className="settings-card">
                    <div className="card-header">
                      <div className="card-title">
                        <Upload size={20} />
                        <span>Importar Backup</span>
                      </div>
                    </div>
                    
                    <div className="card-body active">
                      <p><strong>Atenção:</strong> Importar um backup irá <strong>substituir</strong> todos os projetos e configurações atuais.</p>
                      
                      <button 
                        className="secondary-button"
                        onClick={startImport}
                      >
                        <Upload size={18} />
                        Importar Backup
                      </button>
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
                        <h4>{appInfo.name}</h4>
                        <p className="version">Versão {appInfo.version}</p>
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
            <button className="primary-button" onClick={onSave} style={{ width: '100%' }}>
              Concluir
            </button>
          </div>
        </motion.div>
      </div>
      
      {/* Render Password Modal outside the main modal container but inside AnimatePresence if needed, or better: parallel to it */}
       <PasswordModal 
         isOpen={passwordModal.isOpen}
         mode={passwordModal.mode}
         onCancel={() => setPasswordModal({ ...passwordModal, isOpen: false })}
         onConfirm={(pwd) => {
             if (passwordModal.mode === 'export') handleExport(pwd);
             else handleImport(pwd);
         }}
      />
    </AnimatePresence>
  );
};
