import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import Database from "@tauri-apps/plugin-sql";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Moon, Sun, Save, AlertCircle } from "lucide-react";
import { AnimatePresence } from "framer-motion";

// Components
import { Sidebar } from "./components/Sidebar";
import { Toolbar } from "./components/Toolbar";
import { Canvas } from "./components/Canvas";
import { SettingsModal } from "./components/SettingsModal";
import { AiModal } from "./components/AiModal";
import { ErrorModal } from "./components/ErrorModal";
import { LayersPanel } from "./components/LayersPanel";
import { ProjectsScreen } from "./components/ProjectsScreen";

// Types
import { Slide, SlideTheme, SlideFont, Project } from "./types";

import "./App.css";

function App() {
  // Project Management
  const [currentScreen, setCurrentScreen] = useState<'projects' | 'editor'>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  
  // Existing states
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
  const [isLayersOpen, setIsLayersOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [appTheme, setAppTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('app-theme') as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('app-theme', appTheme);
  }, [appTheme]);

  const activeSlide = slides.find((s) => s.id === activeSlideId) || slides[0];

  useEffect(() => {
    async function initDb() {
      console.log('🔄 Inicializando banco de dados...');
      try {
        const db = await Database.load("sqlite:slideflow.db");
        console.log('✅ Banco de dados conectado');
        
        await db.execute("CREATE TABLE IF NOT EXISTS secrets (name TEXT PRIMARY KEY, value TEXT)");
        console.log('✅ Tabela secrets verificada/criada');
        
        // Carregar API Key
        const result = await db.select<{ value: string }[]>(
          "SELECT value FROM secrets WHERE name = 'gemini_api_key'"
        );
        
        if (result.length > 0) {
          console.log('🔑 API Key encontrada no banco, descriptografando...');
          const decrypted: string = await invoke("decrypt_key", { encryptedKey: result[0].value });
          setGeminiKey(decrypted);
          console.log('✅ API Key carregada com sucesso');
        } else {
          console.log('⚠️ Nenhuma API Key encontrada no banco');
        }

        // Carregar status enabled
        const enabledResult = await db.select<{ value: string }[]>(
          "SELECT value FROM secrets WHERE name = 'gemini_enabled'"
        );
        if (enabledResult.length > 0) {
          setGeminiEnabled(enabledResult[0].value === "true");
          console.log('✅ Status enabled carregado:', enabledResult[0].value);
        }

        // Carregar modelo selecionado
        const modelResult = await db.select<{ value: string }[]>(
          "SELECT value FROM secrets WHERE name = 'selected_model'"
        );
        if (modelResult.length > 0) {
          setSelectedModel(modelResult[0].value);
          console.log('✅ Modelo selecionado carregado:', modelResult[0].value);
        }
        
        console.log('✅ Inicialização do banco concluída');
      } catch (err) {
        console.error("❌ Erro ao carregar SQLite:", err);
        console.error("Detalhes do erro:", JSON.stringify(err, null, 2));
      }
    }
    initDb();
  }, []);

  // Load projects from database
  useEffect(() => {
    async function loadProjects() {
      try {
        const db = await Database.load("sqlite:slideflow.db");
        await db.execute(`
          CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            data TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          )
        `);
        
        const result = await db.select<any[]>("SELECT * FROM projects ORDER BY updated_at DESC");
        const loadedProjects: Project[] = result.map(row => ({
          id: row.id,
          name: row.name,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          ...JSON.parse(row.data)
        }));
        
        setProjects(loadedProjects);
        console.log(`✅ ${loadedProjects.length} projeto(s) carregado(s)`);
      } catch (err) {
        console.error("❌ Erro ao carregar projetos:", err);
      }
    }
    loadProjects();
  }, []);

  // Track unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Mark as changed when slides, theme, or font change
  useEffect(() => {
    if (!currentProjectId || currentScreen !== 'editor') return;
    setHasUnsavedChanges(true);
  }, [slides, activeTheme, activeFont]);

  const saveCurrentProject = async () => {
    if (!currentProjectId) return;
    
    setIsSaving(true);
    try {
      const db = await Database.load("sqlite:slideflow.db");
      const project = projects.find(p => p.id === currentProjectId);
      if (!project) return;

      const data = JSON.stringify({
        slides,
        activeTheme,
        activeFont
      });

      await db.execute(
        "UPDATE projects SET data = ?, updated_at = ? WHERE id = ?",
        [data, new Date().toISOString(), currentProjectId]
      );

      setProjects(prev => prev.map(p => 
        p.id === currentProjectId 
          ? { ...p, slides, activeTheme, activeFont, updatedAt: new Date().toISOString() }
          : p
      ));
      
      setHasUnsavedChanges(false);
      console.log('💾 Projeto salvo com sucesso');
    } catch (err) {
      console.error("❌ Erro ao salvar projeto:", err);
      alert("Erro ao salvar o projeto. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const createNewProject = async () => {
    const projectId = `proj-${Date.now()}`;
    const now = new Date().toISOString();
    const initialSlides: Slide[] = [
      { 
        id: "1", 
        title: "Meu Primeiro Slide", 
        subtitle: "Clique para editar este subtítulo...",
        elements: [
          { id: 'el-1', type: 'text', content: 'Meu Primeiro Slide', x: 60, y: 150, width: 880, fontSize: 48, color: 'var(--theme-text)' },
          { id: 'el-2', type: 'text', content: 'Clique para editar este subtítulo...', x: 60, y: 250, width: 880, fontSize: 24, color: 'var(--theme-text)' }
        ]
      }
    ];

    const newProject: Project = {
      id: projectId,
      name: "Novo Projeto",
      createdAt: now,
      updatedAt: now,
      slides: initialSlides,
      activeTheme: "light",
      activeFont: "sans"
    };

    try {
      const db = await Database.load("sqlite:slideflow.db");
      const data = JSON.stringify({
        slides: initialSlides,
        activeTheme: "light",
        activeFont: "sans"
      });

      await db.execute(
        "INSERT INTO projects (id, name, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
        [projectId, newProject.name, data, now, now]
      );

      setProjects(prev => [newProject, ...prev]);
      openProject(projectId);
      console.log('✅ Novo projeto criado');
    } catch (err) {
      console.error("❌ Erro ao criar projeto:", err);
    }
  };

  const openProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    setSlides(project.slides);
    setActiveTheme(project.activeTheme);
    setActiveFont(project.activeFont);
    setActiveSlideId(project.slides[0]?.id || "1");
    setCurrentProjectId(projectId);
    setCurrentScreen('editor');
    console.log(`📂 Projeto "${project.name}" aberto`);
  };

  const deleteProject = async (projectId: string) => {
    try {
      const db = await Database.load("sqlite:slideflow.db");
      await db.execute("DELETE FROM projects WHERE id = ?", [projectId]);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      console.log('🗑️ Projeto deletado');
    } catch (err) {
      console.error("❌ Erro ao deletar projeto:", err);
    }
  };

  const renameProject = async (projectId: string, newName: string) => {
    try {
      const db = await Database.load("sqlite:slideflow.db");
      await db.execute("UPDATE projects SET name = ? WHERE id = ?", [newName, projectId]);
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, name: newName } : p));
      console.log(`✏️ Projeto renomeado para "${newName}"`);
    } catch (err) {
      console.error("❌ Erro ao renomear projeto:", err);
    }
  };

  const backToProjects = async () => {
    if (hasUnsavedChanges) {
      const confirmed = confirm("Você tem alterações não salvas. Deseja salvar antes de voltar?");
      if (confirmed) {
        await saveCurrentProject();
      } else {
        const discard = confirm("Tem certeza que deseja descartar as alterações?");
        if (!discard) return;
      }
    }
    setCurrentScreen('projects');
    setCurrentProjectId(null);
    setHasUnsavedChanges(false);
  };

  const addSlide = () => {
    setSlides(prev => {
      const newId = (prev.length + 1).toString();
      const maxWidth = 880; // Largura máxima com margens dos dois lados
      
      const newSlide: Slide = { 
        id: newId, 
        title: "Novo Slide", 
        subtitle: "Clique para editar o conteúdo...",
        elements: [
          { 
            id: `el-${Date.now()}-1`, 
            type: 'text', 
            content: 'Novo Slide', 
            x: 60, 
            y: 100, 
            width: maxWidth,
            fontSize: 48,
            color: 'var(--theme-text)'
          },
          { 
            id: `el-${Date.now()}-2`, 
            type: 'text', 
            content: 'Clique para editar o conteúdo...', 
            x: 60, 
            y: 220,
            width: maxWidth,
            fontSize: 24,
            color: 'var(--theme-text)'
          }
        ]
      };
      return [...prev, newSlide];
    });
    setActiveSlideId((slides.length + 1).toString());
  };

  const deleteSlide = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (slides.length === 1) return;
    
    setSlides(prev => prev.filter(s => s.id !== id));
    if (activeSlideId === id) {
      const currentIndex = slides.findIndex(s => s.id === id);
      const nextSlide = slides[currentIndex + 1] || slides[currentIndex - 1];
      setActiveSlideId(nextSlide.id);
    }
  };

  const duplicateSlide = (id: string) => {
    const slideToDuplicate = slides.find(s => s.id === id);
    if (!slideToDuplicate) return;

    const newId = `${Date.now()}`;
    const duplicatedSlide: Slide = {
      ...slideToDuplicate,
      id: newId,
      title: `${slideToDuplicate.title} (Cópia)`,
      elements: slideToDuplicate.elements.map(el => ({
        ...el,
        id: `el-${Date.now()}-${Math.random()}`
      }))
    };

    setSlides(prev => {
      const index = prev.findIndex(s => s.id === id);
      return [...prev.slice(0, index + 1), duplicatedSlide, ...prev.slice(index + 1)];
    });
  };

  const reorderSlides = (fromIndex: number, toIndex: number) => {
    setSlides(prev => {
      const newSlides = [...prev];
      const [removed] = newSlides.splice(fromIndex, 1);
      newSlides.splice(toIndex, 0, removed);
      return newSlides;
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

  const moveElement = (slideId: string, elementId: string, direction: 'forward' | 'backward' | 'front' | 'back') => {
    setSlides(prev => prev.map(s => {
      if (s.id !== slideId) return s;
      const elements = [...s.elements];
      const index = elements.findIndex(el => el.id === elementId);
      if (index === -1) return s;

      const element = elements.splice(index, 1)[0];
      if (direction === 'forward') {
        elements.splice(Math.min(index + 1, s.elements.length), 0, element);
      } else if (direction === 'backward') {
        elements.splice(Math.max(index - 1, 0), 0, element);
      } else if (direction === 'front') {
        elements.push(element);
      } else if (direction === 'back') {
        elements.unshift(element);
      }
      return { ...s, elements };
    }));
  };

  const addElement = (type: 'text' | 'rect' | 'circle' | 'image') => {
    if (type === 'image') {
      fileInputRef.current?.click();
      return;
    }

    const newElement: any = {
      id: `el-${Date.now()}`,
      type,
      content: type === 'text' ? 'Novo Texto' : '',
      x: 300,
      y: 200,
      width: type === 'text' ? undefined : 150,
      height: type === 'text' ? undefined : 150,
      fontSize: type === 'text' ? 24 : undefined,
      color: type === 'text' ? 'var(--theme-text)' : 'var(--accent)'
    };
    
    setSlides(prev => prev.map(s => {
      if (s.id !== activeSlideId) return s;
      return { ...s, elements: [...s.elements, newElement] };
    }));
    setSelectedElementId(newElement.id);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const width = 300;
        const height = width / aspectRatio;

        const newElement: any = {
          id: `el-${Date.now()}`,
          type: 'image',
          content: dataUrl,
          x: 200,
          y: 150,
          width,
          height,
          color: 'transparent'
        };

        setSlides(prev => prev.map(s => {
          if (s.id !== activeSlideId) return s;
          return { ...s, elements: [...s.elements, newElement] };
        }));
        setSelectedElementId(newElement.id);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    // Reset input so the same file can be selected again
    e.target.value = '';
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
        ? `IMPORTANTE: Após os slides de conteúdo, você deve criar ${numQuizQuestions} slide(s) de QUIZ SEPARADOS.
        
REGRAS PARA SLIDES DE QUIZ:
- O "title" deve conter APENAS a pergunta (sem alternativas)
- O "subtitle" deve conter as alternativas formatadas como lista, uma por linha, exemplo:
A. Primeira alternativa
B. Segunda alternativa
C. Terceira alternativa
D. Quarta alternativa

NUNCA misture as alternativas (A, B, C, D) no meio do texto da pergunta.` 
        : "";

      const prompt = `Você é um especialista em criação de apresentações educacionais. 
      
TÓPICO: "${aiPrompt}"

ESTILO DE CONTEÚDO: ${densityInstructions}

${quizInstruction}

ESTRUTURA DA APRESENTAÇÃO:
1. Slide 1: CAPA - Título impactante e subtítulo descritivo
2. Slides 2 a ${numSlides + 1}: CONTEÚDO - Desenvolva o tema de forma clara e organizada
   - IMPORTANTE: Estes slides NÃO devem conter perguntas ou alternativas de quiz
   - Foque apenas em explicar o conteúdo
3. ${includeQuiz ? `Slides ${numSlides + 2} a ${numSlides + 1 + numQuizQuestions}: QUESTIONÁRIO - Perguntas com 4 alternativas cada` : ""}
4. Último slide: ENCERRAMENTO - Mensagem final ou resumo

FORMATO DE SAÍDA:
Retorne um array JSON com exatamente ${numSlides + 2 + (includeQuiz ? numQuizQuestions : 0)} objetos no formato:
{"title": "Título do slide", "subtitle": "Conteúdo ou alternativas (para quiz)"}

IMPORTANTE: Não use markdown, não adicione explicações extras, apenas o JSON puro.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonStr = text.replace(/```json|```/g, "").trim();
      const slidesData = JSON.parse(jsonStr);

      if (Array.isArray(slidesData)) {
        const newSlides: Slide[] = slidesData.map((s, i) => {
          const slideId = Date.now() + i + "";
          
          // Detectar se é um slide de quiz (geralmente tem alternativas A, B, C, D)
          const isQuizSlide = s.subtitle && /^[A-D]\.\s/.test(s.subtitle);
          
          // Calcular tamanho de fonte dinâmico baseado no comprimento do texto
          const titleLength = (s.title || "").length;
          const subtitleLength = (s.subtitle || "").length;
          
          // Título: quanto mais longo, menor a fonte
          let titleFontSize = 48;
          if (titleLength > 100) titleFontSize = 24;
          else if (titleLength > 80) titleFontSize = 28;
          else if (titleLength > 60) titleFontSize = 32;
          else if (titleLength > 40) titleFontSize = 36;
          
          // Subtítulo: ajustar baseado no tipo e tamanho
          let subtitleFontSize = 24;
          if (isQuizSlide) {
            // Quiz slides precisam de fonte menor para caber as alternativas
            if (subtitleLength > 200) subtitleFontSize = 16;
            else if (subtitleLength > 150) subtitleFontSize = 18;
            else subtitleFontSize = 20;
          } else {
            // Slides normais
            if (subtitleLength > 300) subtitleFontSize = 18;
            else if (subtitleLength > 200) subtitleFontSize = 20;
            else if (subtitleLength > 100) subtitleFontSize = 22;
          }
          
          // Calcular altura estimada do título (aproximação)
          const titleLines = Math.ceil(titleLength / 40); // ~40 chars por linha
          const titleHeight = titleFontSize * titleLines * 1.2; // line-height ~1.2
          
          // Ajustar posição Y do subtítulo baseado na altura real do título
          const titleY = 100; // Começar um pouco mais alto
          const subtitleY = titleY + titleHeight + 30; // 30px de margem entre título e subtítulo
          
          // Largura máxima para o texto (deixar margem dos dois lados)
          const maxWidth = 880; // 1000 - 60 (margem esq) - 60 (margem dir)
          
          return {
            id: slideId,
            title: s.title || "Sem título",
            subtitle: s.subtitle || "",
            elements: [
              { 
                id: `el-${slideId}-t`, 
                type: 'text', 
                content: s.title || "Sem título", 
                x: 60, 
                y: titleY, 
                width: maxWidth,
                fontSize: titleFontSize,
                color: 'var(--theme-text)'
              },
              { 
                id: `el-${slideId}-s`, 
                type: 'text', 
                content: s.subtitle || "", 
                x: 60, 
                y: subtitleY,
                width: maxWidth,
                fontSize: subtitleFontSize,
                color: 'var(--theme-text)',
                // Justificar texto se for muito longo
                ...(subtitleLength > 150 ? { textAlign: 'justify' } : {})
              }
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
    <div className={`app-container app-theme-${appTheme} ${currentScreen === 'editor' ? 'editor-mode' : ''}`}>
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*"
        onChange={handleImageSelect}
      />

      {currentScreen === 'projects' ? (
        <ProjectsScreen
          projects={projects}
          onCreateNew={createNewProject}
          onOpenProject={openProject}
          onDeleteProject={deleteProject}
          onRenameProject={renameProject}
        />
      ) : (
        <>
          <header>
            <div className="logo-section">
              <div className="logo-icon">MS</div>
              <h1>MangoSlides</h1>
            </div>
            <div className="header-actions">
              <button 
                onClick={saveCurrentProject}
                disabled={isSaving || !hasUnsavedChanges}
                style={{
                  background: hasUnsavedChanges ? 'var(--accent)' : 'var(--bg-main)',
                  border: `1px solid ${hasUnsavedChanges ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: '8px',
                  padding: '8px 16px',
                  color: hasUnsavedChanges ? 'white' : 'var(--text-primary)',
                  cursor: isSaving || !hasUnsavedChanges ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: isSaving || !hasUnsavedChanges ? 0.5 : 1
                }}
                title={hasUnsavedChanges ? 'Salvar alterações' : 'Nenhuma alteração pendente'}
              >
                {isSaving ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid currentColor',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite'
                    }} />
                    Salvando...
                  </>
                ) : (
                  <>
                    {hasUnsavedChanges && <AlertCircle size={16} />}
                    <Save size={16} />
                    Salvar
                  </>
                )}
              </button>
              <button 
                onClick={backToProjects}
                style={{
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  transition: 'all 0.2s'
                }}
              >
                ← Voltar aos Projetos
              </button>
              <button 
                onClick={() => setAppTheme(appTheme === 'dark' ? 'light' : 'dark')}
                style={{
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {appTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </header>

          <Sidebar
            slides={slides}
            activeSlideId={activeSlideId}
            onSlideSelect={setActiveSlideId}
            onAddSlide={addSlide}
            onDeleteSlide={deleteSlide}
            onDuplicateSlide={duplicateSlide}
            onReorderSlides={reorderSlides}
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
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenAiModal={() => setIsAiModalOpen(true)}
              activeSlideId={activeSlideId}
              updateSlide={updateSlide}
              onToggleLayers={() => setIsLayersOpen(!isLayersOpen)}
            />

            <Canvas
              activeSlide={activeSlide}
              activeTool={activeTool}
              selectedElementId={selectedElementId}
              setSelectedElementId={setSelectedElementId}
              updateSlide={updateSlide}
              updateElement={updateElement}
              moveElement={moveElement}
              deleteElement={deleteElement}
              theme={activeTheme}
              font={activeFont}
            />
          </main>

          <AnimatePresence>
            {isLayersOpen && (
              <LayersPanel
                elements={activeSlide.elements}
                selectedElementId={selectedElementId}
                onSelectElement={setSelectedElementId}
                onReorder={(fromIndex: number, toIndex: number) => {
                  const direction = fromIndex < toIndex ? 'forward' : 'backward';
                  moveElement(activeSlideId, activeSlide.elements[fromIndex].id, direction);
                }}
                onClose={() => setIsLayersOpen(false)}
              />
            )}
          </AnimatePresence>

          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            geminiKey={geminiKey}
            setGeminiKey={setGeminiKey}
            geminiEnabled={geminiEnabled}
            setGeminiEnabled={setGeminiEnabled}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            onSave={saveSettings}
          />

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

          <ErrorModal
            isOpen={isErrorModalOpen}
            onClose={() => setIsErrorModalOpen(false)}
            errorDetails={errorDetails}
          />
        </>
      )}
    </div>
  );
}

export default App;
