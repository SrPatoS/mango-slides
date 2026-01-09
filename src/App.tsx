import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import Database from "@tauri-apps/plugin-sql";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnimatePresence } from "framer-motion";

// Components
import { Sidebar } from "./components/Sidebar";
import { Toolbar } from "./components/Toolbar";
import { Canvas } from "./components/Canvas";
import { SettingsModal } from "./components/SettingsModal";
import { AiModal } from "./components/AiModal";
import { ErrorModal } from "./components/ErrorModal";

// Types
import { Slide, SlideTheme, SlideFont } from "./types";

import "./App.css";

function App() {
  const [slides, setSlides] = useState<Slide[]>([
    { 
      id: "1", 
      title: "Meu Primeiro Slide", 
      subtitle: "Clique para editar este subtítulo...",
      elements: [
        { id: 'el-1', type: 'text', content: 'Meu Primeiro Slide', x: 100, y: 100, fontSize: 48 },
        { id: 'el-2', type: 'text', content: 'Clique para editar este subtítulo...', x: 100, y: 200, fontSize: 24 }
      ]
    },
  ]);
  const [activeSlideId, setActiveSlideId] = useState<string>("1");
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [activeTheme, setActiveTheme] = useState<SlideTheme>("light");
  const [activeFont, setActiveFont] = useState<SlideFont>("sans");
  const [activeTool, setActiveTool] = useState<string>("select");
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

  const activeSlide = slides.find((s) => s.id === activeSlideId) || slides[0];

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

  const addSlide = () => {
    setSlides(prev => {
      const newId = (prev.length + 1).toString();
      const newSlide: Slide = { 
        id: newId, 
        title: "Novo Slide", 
        subtitle: "Conteúdo do novo slide",
        elements: [
          { id: `el-${Date.now()}-1`, type: 'text', content: 'Novo Slide', x: 100, y: 100, fontSize: 48 },
          { id: `el-${Date.now()}-2`, type: 'text', content: 'Conteúdo do novo slide', x: 100, y: 200, fontSize: 24 }
        ]
      };
      return [...prev, newSlide];
    });
    // We can't easily get the new ID here without more changes, but (slides.length + 1) is usually fine for UI focus
    setActiveSlideId((slides.length + 1).toString());
  };

  const deleteSlide = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSlides(prev => {
      if (prev.length <= 1) return prev; // Prevent deleting the last slide
      const filtered = prev.filter((s) => s.id !== id);
      if (activeSlideId === id && filtered.length > 0) {
        // Find the index of the deleted slide in the original array
        const currentIndex = prev.findIndex(s => s.id === id);
        // Determine the next active slide: if not the first, then the one before; otherwise, the new first
        const nextActiveIndex = currentIndex > 0 ? currentIndex - 1 : 0;
        setActiveSlideId(filtered[nextActiveIndex].id);
      } else if (filtered.length === 0) {
        // This case should ideally not happen if we prevent deleting the last slide
        setActiveSlideId(""); // Or handle as appropriate for an empty state
      }
      return filtered;
    });
  };

  const updateSlide = (id: string, updates: Partial<Slide>) => {
    setSlides(prev => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const updateElement = (slideId: string, elementId: string, updates: Partial<any>) => {
    setSlides(prev => prev.map(s => {
      if (s.id !== slideId) return s;
      return {
        ...s,
        elements: s.elements.map(el => el.id === elementId ? { ...el, ...updates } : el)
      };
    }));
  };

  const addElement = (type: 'text' | 'rect' | 'circle' | 'image') => {
    const newElement: any = {
      id: `el-${Date.now()}`,
      type,
      content: type === 'text' ? 'Novo Texto' : '',
      x: 300,
      y: 200,
      width: type === 'text' ? undefined : 150,
      height: type === 'text' ? undefined : 150,
      fontSize: type === 'text' ? 24 : undefined,
      color: 'var(--accent)'
    };

    setSlides(prev => prev.map(s => {
      if (s.id !== activeSlideId) return s;
      return { ...s, elements: [...s.elements, newElement] };
    }));
  };

  const deleteElement = (slideId: string, elementId: string) => {
    setSlides(prev => prev.map(s => {
      if (s.id !== slideId) return s;
      return {
        ...s,
        elements: s.elements.filter(el => el.id !== elementId)
      };
    }));
    if (selectedElementId === elementId) setSelectedElementId(null);
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
        ? `Após os slides de conteúdo, inclua exatamente ${numQuizQuestions} slide(s) de QUESTIONÁRIO/QUIZ. Cada slide de quiz deve ter uma pergunta no "title" e as opções de resposta no "subtitle" formatadas como tópicos.` 
        : "";

      const prompt = `Você é um especialista em criação de apresentações. 
      Com base no tópico: "${aiPrompt}", gere uma apresentação completa.
      ESTILO DE CONTEÚDO: ${densityInstructions}
      ${quizInstruction}
      A apresentação deve ter o seguinte fluxo:
      1. Capa impactante.
      2. Seguem ${numSlides} slides de CONTEÚDO detalhando o tópico.
      3. ${includeQuiz ? `Seguem ${numQuizQuestions} slides de QUESTIONÁRIO.` : ""}
      4. Slide de ENCERRAMENTO.
      Saída: Array JSON com exatamente ${numSlides + 2 + (includeQuiz ? numQuizQuestions : 0)} objetos {"title", "subtitle"}. Sem markdown.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonStr = text.replace(/```json|```/g, "").trim();
      const slidesData = JSON.parse(jsonStr);

      if (Array.isArray(slidesData)) {
        const newSlides: Slide[] = slidesData.map((s, i) => {
          const slideId = Date.now() + i + "";
          return {
            id: slideId,
            title: s.title || "Sem título",
            subtitle: s.subtitle || "",
            elements: [
              { id: `el-${slideId}-t`, type: 'text', content: s.title || "Sem título", x: 100, y: 100, fontSize: 48 },
              { id: `el-${slideId}-s`, type: 'text', content: s.subtitle || "", x: 100, y: 200, fontSize: 24 }
            ]
          };
        });

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
          <div className="logo-icon">SF</div>
          <h1>SlideFlow</h1>
        </div>
        <div className="header-actions">
          <button className="btn-secondary">Exportar</button>
          <button className="btn-primary" onClick={() => setIsAiModalOpen(true)}>Apresentar</button>
        </div>
      </header>

      <Sidebar 
        slides={slides}
        activeSlideId={activeSlideId}
        setActiveSlideId={setActiveSlideId}
        addSlide={addSlide}
        deleteSlide={deleteSlide}
        theme={activeTheme}
        font={activeFont}
      />

      <main>
        <Toolbar 
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          activeTheme={activeTheme}
          setActiveTheme={setActiveTheme}
            activeFont={activeFont}
            setActiveFont={setActiveFont}
            addElement={addElement}
            onOpenAiModal={() => setIsAiModalOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        <Canvas 
          activeSlide={activeSlide}
          activeTool={activeTool}
          selectedElementId={selectedElementId}
          setSelectedElementId={setSelectedElementId}
          updateSlide={updateSlide}
          updateElement={updateElement}
          deleteElement={deleteElement}
          theme={activeTheme}
          font={activeFont}
        />
      </main>

      <AnimatePresence>
        <SettingsModal 
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          geminiKey={geminiKey}
          setGeminiKey={setGeminiKey}
          geminiEnabled={geminiEnabled}
          setGeminiEnabled={setGeminiEnabled}
          onSave={saveSettings}
        />
      </AnimatePresence>

      <AnimatePresence>
        <AiModal 
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          isGenerating={isGenerating}
          aiPrompt={aiPrompt}
          setAiPrompt={setAiPrompt}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          contentDensity={contentDensity}
          setContentDensity={setContentDensity}
          numSlides={numSlides}
          setNumSlides={setNumSlides}
          includeQuiz={includeQuiz}
          setIncludeQuiz={setIncludeQuiz}
          numQuizQuestions={numQuizQuestions}
          setNumQuizQuestions={setNumQuizQuestions}
          onGenerate={generateContent}
        />
      </AnimatePresence>

      <AnimatePresence>
        <ErrorModal 
          isOpen={isErrorModalOpen}
          onClose={() => setIsErrorModalOpen(false)}
          errorDetails={errorDetails}
        />
      </AnimatePresence>
    </div>
  );
}

export default App;
