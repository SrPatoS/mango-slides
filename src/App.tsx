import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import Database from "@tauri-apps/plugin-sql";
import { 
  Plus, 
  Play, 
  MousePointer2, 
  Type, 
  Image as ImageIcon, 
  Square, 
  Circle, 
  Settings, 
  Download,
  Layers,
  X,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

interface Slide {
  id: string;
  title: string;
  subtitle: string;
}

function App() {
  const [slides, setSlides] = useState<Slide[]>([
    { id: "1", title: "Novo Projeto", subtitle: "Clique para editar o subtítulo" }
  ]);
  const [activeSlideId, setActiveSlideId] = useState("1");
  const [activeTool, setActiveTool] = useState("select");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [geminiKey, setGeminiKey] = useState("");

  // Inicializar Banco de Dados e carregar chave
  useEffect(() => {
    async function initDb() {
      try {
        const db = await Database.load("sqlite:slideflow.db");
        await db.execute("CREATE TABLE IF NOT EXISTS secrets (name TEXT PRIMARY KEY, value TEXT)");
        
        const result = await db.select<{ value: string }[]>(
          "SELECT value FROM secrets WHERE name = 'gemini_api_key'"
        );
        
        if (result.length > 0) {
          const decrypted: string = await invoke("decrypt_key", { encrypted_key: result[0].value });
          setGeminiKey(decrypted);
        }
      } catch (err) {
        console.error("Erro ao carregar SQLite:", err);
      }
    }
    initDb();
  }, []);

  const activeSlide = slides.find(s => s.id === activeSlideId) || slides[0];

  const addSlide = () => {
    const newId = (slides.length + 1).toString();
    const newSlide = {
      id: newId,
      title: "Novo Slide",
      subtitle: "Adicione seu conteúdo"
    };
    setSlides([...slides, newSlide]);
    setActiveSlideId(newId);
  };

  const updateSlide = (id: string, updates: Partial<Slide>) => {
    setSlides(slides.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const saveSettings = async () => {
    try {
      const encrypted: string = await invoke("encrypt_key", { key: geminiKey });
      const db = await Database.load("sqlite:slideflow.db");
      await db.execute(
        "INSERT OR REPLACE INTO secrets (name, value) VALUES ('gemini_api_key', ?)",
        [encrypted]
      );
      setIsSettingsOpen(false);
    } catch (err) {
      console.error("Erro ao salvar no SQLite:", err);
    }
  };

  return (
    <div className="app-container">
      <header>
        <div className="logo-section">
          <div className="logo-icon">
            <Plus size={20} />
          </div>
          <span>SlideFlow</span>
        </div>
        <div className="header-actions">
          <button className="secondary">
            <Download size={18} />
            Exportar
          </button>
          <button className="primary">
            <Play size={18} fill="currentColor" />
            Apresentar
          </button>
        </div>
      </header>

      <aside>
        <div className="slide-list">
          {slides.map((slide, index) => (
            <motion.div 
              key={slide.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`slide-thumb ${activeSlideId === slide.id ? "active" : ""}`}
              onClick={() => setActiveSlideId(slide.id)}
            >
              <span className="slide-thumb-number">{index + 1}</span>
              <div style={{ transform: 'scale(0.15)', whiteSpace: 'nowrap' }}>
                <h3 style={{ fontSize: '40px' }}>{slide.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>
        
        <button className="secondary add-slide-btn" onClick={addSlide}>
          <Plus size={18} />
          Novo Slide
        </button>
      </aside>

      <main>
        <div className="toolbar">
          {[
            { id: 'select', icon: MousePointer2 },
            { id: 'text', icon: Type },
            { id: 'image', icon: ImageIcon },
            { id: 'rect', icon: Square },
            { id: 'circle', icon: Circle },
            { id: 'layers', icon: Layers },
            { id: 'settings', icon: Settings, onClick: () => setIsSettingsOpen(true) },
          ].map((tool) => (
            <button 
              key={tool.id}
              className={`tool-btn ${activeTool === tool.id ? 'active' : ''}`}
              onClick={tool.onClick ? tool.onClick : () => setActiveTool(tool.id)}
            >
              <tool.icon size={20} />
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={activeSlideId}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.2 }}
            className="slide-canvas"
          >
            <div className="slide-content">
              <h1 
                className="slide-title" 
                contentEditable 
                suppressContentEditableWarning
                onBlur={(e) => updateSlide(activeSlide.id, { title: e.currentTarget.textContent || "" })}
              >
                {activeSlide.title}
              </h1>
              <p 
                className="slide-subtitle" 
                contentEditable 
                suppressContentEditableWarning
                onBlur={(e) => updateSlide(activeSlide.id, { subtitle: e.currentTarget.textContent || "" })}
              >
                {activeSlide.subtitle}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {isSettingsOpen && (
          <div className="settings-overlay" onClick={() => setIsSettingsOpen(false)}>
            <motion.div 
              className="settings-modal" 
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
            >
              <div className="settings-header">
                <h2>Configurações</h2>
                <button className="close-btn" onClick={() => setIsSettingsOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              
              <div className="settings-content">
                <section className="settings-section">
                  <h3>Integrações de IA</h3>
                  <div className="ai-card">
                    <div className="ai-card-header">
                      <div className="ai-logo">
                        <Sparkles className="sparkle-icon" size={24} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Google Gemini</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          Para geração de conteúdo e sugestões de design.
                        </p>
                      </div>
                    </div>
                    
                    <div className="input-group">
                      <label htmlFor="gemini-key">API Key</label>
                      <input 
                        id="gemini-key" 
                        type="password" 
                        placeholder="Insira sua chave do Google AI Studio..."
                        value={geminiKey}
                        onChange={(e) => setGeminiKey(e.target.value)}
                      />
                    </div>
                  </div>
                </section>
                
                <section className="settings-section">
                  <h3>Preferências Gerais</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Em breve: Temas, exportação de alta resolução e backup na nuvem.
                  </p>
                </section>
              </div>

              <div className="settings-footer">
                <button className="secondary" onClick={() => setIsSettingsOpen(false)}>Cancelar</button>
                <button className="primary" onClick={saveSettings}>Salvar Alterações</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
