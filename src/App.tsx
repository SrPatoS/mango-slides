import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import Database from "@tauri-apps/plugin-sql";
import { GoogleGenerativeAI } from "@google/generative-ai";
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
  Sparkles,
  AlertCircle,
  Trash2
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
  const [geminiEnabled, setGeminiEnabled] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
  const [numSlides, setNumSlides] = useState(3);
  const [contentDensity, setContentDensity] = useState("medium");
  const [includeQuiz, setIncludeQuiz] = useState(false);
  const [numQuizQuestions, setNumQuizQuestions] = useState(1);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

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

        const enabledResult = await db.select<{ value: string }[]>(
          "SELECT value FROM secrets WHERE name = 'gemini_enabled'"
        );
        if (enabledResult.length > 0) {
          setGeminiEnabled(enabledResult[0].value === "true");
        }

        const modelResult = await db.select<{ value: string }[]>(
          "SELECT value FROM secrets WHERE name = 'selected_model'"
        );
        if (modelResult.length > 0) {
          setSelectedModel(modelResult[0].value);
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
      await db.execute(
        "INSERT OR REPLACE INTO secrets (name, value) VALUES ('gemini_enabled', ?)",
        [geminiEnabled ? "true" : "false"]
      );
      await db.execute(
        "INSERT OR REPLACE INTO secrets (name, value) VALUES ('selected_model', ?)",
        [selectedModel]
      );
      setIsSettingsOpen(false);
    } catch (err) {
      console.error("Erro ao salvar no SQLite:", err);
    }
  };

  const deleteSlide = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (slides.length <= 1) return;

    const newSlides = slides.filter(s => s.id !== id);
    setSlides(newSlides);

    if (activeSlideId === id) {
      const currentIndex = slides.findIndex(s => s.id === id);
      const nextActiveIndex = currentIndex > 0 ? currentIndex - 1 : 0;
      setActiveSlideId(newSlides[nextActiveIndex].id);
    }
  };

  const generateContent = async () => {
    if (!geminiKey) {
      alert("Por favor, configure sua API Key nas configurações primeiro.");
      return;
    }

    setIsGenerating(true);
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: selectedModel });

      const densityMap = {
        bullets: "Use APENAS tópicos curtos e objetivos (bullet points). Máximo de 4 tópicos por slide.",
        low: "Use textos curtos e diretos, foco em frases de impacto e pouco detalhamento.",
        medium: "Equilibre tópicos e frases explicativas. Conteúdo moderado.",
        high: "Use textos mais densos e detalhados, com explicações completas e parágrafos estruturados."
      };
      
      const densityInstructions = densityMap[contentDensity as keyof typeof densityMap];
      
      const quizInstruction = includeQuiz 
        ? `Após os slides de conteúdo, inclua exatamente ${numQuizQuestions} slide(s) de QUESTIONÁRIO/QUIZ. 
           Cada slide de quiz deve ter uma pergunta no "title" e as opções de resposta no "subtitle" formatadas como tópicos.` 
        : "";

      const prompt = `Você é um especialista em criação de apresentações. 
      Com base no tópico: "${aiPrompt}", gere uma apresentação completa.
      
      ESTILO DE CONTEÚDO: ${densityInstructions}
      ${quizInstruction}

      A apresentação deve ter o seguinte fluxo:
      1. O PRIMEIRO slide deve ser uma CAPA impactante.
      2. Devem seguir ${numSlides} slides de CONTEÚDO detalhando o tópico de forma sequencial.
      3. ${includeQuiz ? `Seguem ${numQuizQuestions} slides de QUESTIONÁRIO.` : ""}
      4. O ÚLTIMO slide deve ser de ENCERRAMENTO (agradecimento ou próximos passos).
      
      Siga RIGOROSAMENTE as seguintes regras:
      1. A saída DEVE ser um array JSON contendo exatamente ${numSlides + 2 + (includeQuiz ? numQuizQuestions : 0)} objetos.
      2. Cada objeto deve ter as chaves "title" e "subtitle".
      3. O conteúdo deve ser didático, sequencial e profissional.
      4. Responda APENAS o JSON, sem markdown ou textos adicionais.

      Exemplo de formato:
      [
        {"title": "Título da Capa", "subtitle": "Apresentado por..."},
        {"title": "Slide de Conteúdo 1", "subtitle": "..."},
        ${includeQuiz ? '{"title": "Pergunta do Quiz", "subtitle": "A) Opção 1\\nB) Opção 2..."},' : ""}
        {"title": "Obrigado!", "subtitle": "Dúvidas? Entre em contato."}
      ]`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Limpar possível markdown do JSON
      const jsonStr = text.replace(/```json|```/g, "").trim();
      const slidesData = JSON.parse(jsonStr);

      if (Array.isArray(slidesData)) {
        const newSlides: Slide[] = slidesData.map((s, i) => ({
          id: (slides.length + i + 1).toString(),
          title: s.title || "Sem título",
          subtitle: s.subtitle || ""
        }));

        setSlides([...slides, ...newSlides]);
        setActiveSlideId(newSlides[0].id);
      }
      
      setIsAiModalOpen(false);
      setAiPrompt("");
    } catch (err: any) {
      console.error("Erro na geração de IA:", err);
      setErrorDetails(err.message || String(err));
      setIsErrorModalOpen(true);
    } finally {
      setIsGenerating(false);
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
              {slides.length > 1 && (
                <button 
                  className="delete-slide-btn" 
                  onClick={(e) => deleteSlide(slide.id, e)}
                  title="Excluir slide"
                >
                  <Trash2 size={14} />
                </button>
              )}
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
            { 
              id: 'ai', 
              icon: Sparkles, 
              className: 'ai-sparkle',
              onClick: () => setIsAiModalOpen(true)
            },
            { id: 'settings', icon: Settings, onClick: () => setIsSettingsOpen(true) },
          ].map((tool: any) => (
            <div key={tool.id} className={tool.id === 'ai' ? 'ai-generation-control' : ''}>
                <button 
                  className={`tool-btn ${activeTool === tool.id ? 'active' : ''} ${tool.className || ''}`}
                  onClick={tool.onClick ? tool.onClick : () => setActiveTool(tool.id)}
                >
                  <tool.icon size={20} />
                </button>
              </div>
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
                      <div style={{ marginLeft: 'auto' }}>
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
                    
                    <AnimatePresence>
                      {geminiEnabled && (
                        <motion.div 
                          className="input-group"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <label htmlFor="gemini-key">API Key</label>
                          <input 
                            id="gemini-key" 
                            type="password" 
                            placeholder="Insira sua chave do Google AI Studio..."
                            value={geminiKey}
                            onChange={(e) => setGeminiKey(e.target.value)}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
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

      <AnimatePresence>
        {isAiModalOpen && (
          <div className="settings-overlay" onClick={() => !isGenerating && setIsAiModalOpen(false)}>
            <motion.div 
              className="settings-modal" 
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ maxWidth: '500px' }}
            >
              <div className="settings-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Sparkles size={20} className="sparkle-icon" />
                  <h2 style={{ fontSize: '1.2rem' }}>Gerar conteúdo com IA</h2>
                </div>
                {!isGenerating && (
                  <button className="close-btn" onClick={() => setIsAiModalOpen(false)}>
                    <X size={20} />
                  </button>
                )}
              </div>

              <div className="settings-content">
                {isGenerating ? (
                  <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p style={{ color: 'var(--text-secondary)' }}>A IA está criando {numSlides} slides para você...</p>
                  </div>
                ) : (
                  <div className="prompt-container">
                    <div className="ai-controls-row">
                      <div className="ai-select-container" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          Modelo de IA
                        </label>
                        <select 
                          className="ai-select"
                          value={selectedModel}
                          onChange={(e) => setSelectedModel(e.target.value)}
                        >
                          <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                          <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                        </select>
                      </div>

                      <div className="density-container">
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          Densidade
                        </label>
                        <select 
                          className="ai-select"
                          value={contentDensity}
                          onChange={(e) => setContentDensity(e.target.value)}
                        >
                          <option value="bullets">Apenas Tópicos</option>
                          <option value="low">Pouco Texto</option>
                          <option value="medium">Médio</option>
                          <option value="high">Muito Texto</option>
                        </select>
                      </div>

                      <div className="page-count-container">
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          Nº Slides
                        </label>
                        <input 
                          type="number" 
                          className="page-input"
                          min="1"
                          max="10"
                          value={numSlides}
                          onChange={(e) => setNumSlides(parseInt(e.target.value) || 1)}
                        />
                      </div>
                    </div>

                    <div className="ai-options-grid">
                      <div className="option-toggle-group">
                        <div className="option-label-desc">
                          <span>Incluir Questionário</span>
                          <span>Criar questões ao final</span>
                        </div>
                        <input 
                          type="checkbox" 
                          className="toggle-checkbox"
                          style={{ width: '40px', height: '20px' }}
                          checked={includeQuiz}
                          onChange={(e) => setIncludeQuiz(e.target.checked)}
                        />
                      </div>

                      {includeQuiz && (
                        <div className="quiz-count-input">
                          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            Questões:
                          </label>
                          <input 
                            type="number" 
                            className="page-input"
                            min="1"
                            max="5"
                            style={{ width: '60px' }}
                            value={numQuizQuestions}
                            onChange={(e) => setNumQuizQuestions(parseInt(e.target.value) || 1)}
                          />
                        </div>
                      )}
                    </div>
                    
                    <textarea 
                      className="prompt-textarea"
                      placeholder="Sobre o que deve ser esta apresentação? Ex: Primeiros passos no React, Benefícios do café..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      autoFocus
                    />
                    
                    <div className="prompt-hint">
                      A IA gerará uma capa, {numSlides} slides de conteúdo, 
                      {includeQuiz ? ` ${numQuizQuestions} questão(ões) de fixação ` : ""} 
                      e um encerramento (Total: {numSlides + 2 + (includeQuiz ? numQuizQuestions : 0)} slides).
                    </div>
                  </div>
                )}
              </div>

              <div className="settings-footer">
                <button 
                  className="secondary" 
                  onClick={() => setIsAiModalOpen(false)}
                  disabled={isGenerating}
                >
                  Cancelar
                </button>
                <button 
                  className="primary" 
                  onClick={generateContent}
                  disabled={isGenerating || !aiPrompt.trim()}
                >
                  <Sparkles size={18} />
                  Gerar Slide
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isErrorModalOpen && (
          <div className="settings-overlay" onClick={() => setIsErrorModalOpen(false)}>
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
                <button className="close-btn" onClick={() => setIsErrorModalOpen(false)}>
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
                <button className="btn-danger" onClick={() => setIsErrorModalOpen(false)}>
                  Entendi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
