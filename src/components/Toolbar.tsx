import { useState } from "react";
import { 
  MousePointer2, 
  Type, 
  ImageIcon, 
  Square, 
  Circle, 
  Layers, 
  Sparkles, 
  Settings,
  Palette,
  PaintBucket,
  ALargeSmall
} from "lucide-react";
import { SlideTheme, SlideFont, Slide } from "../types";

interface ToolbarProps {
  activeTool: string;
  setActiveTool: (tool: string) => void;
  activeTheme: SlideTheme;
  setActiveTheme: (theme: SlideTheme) => void;
  activeFont: SlideFont;
  setActiveFont: (font: SlideFont) => void;
  addElement: (type: 'text' | 'rect' | 'circle' | 'image') => void;
  activeSlideId: string;
  updateSlide: (id: string, updates: Partial<Slide>) => void;
  onOpenAiModal: () => void;
  onOpenSettings: () => void;
  onToggleLayers: () => void;
}

export const Toolbar = ({ 
  activeTool, 
  setActiveTool, 
  activeTheme,
  setActiveTheme,
  activeFont,
  setActiveFont,
  addElement,
  activeSlideId,
  updateSlide,
  onOpenAiModal, 
  onOpenSettings,
  onToggleLayers
}: ToolbarProps) => {
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isFontOpen, setIsFontOpen] = useState(false);

  const themes: { id: SlideTheme; name: string; preview: string }[] = [
    { id: 'light', name: 'Claro', preview: '#f8fafc' },
    { id: 'dark', name: 'Escuro', preview: '#0f172a' },
    { id: 'corporate', name: 'Executivo', preview: 'linear-gradient(135deg, #1e293b, #0f172a)' },
    { id: 'purple', name: 'Criativo', preview: 'linear-gradient(135deg, #4c1d95, #1e1b4b)' },
    { id: 'minimal', name: 'Mínimo', preview: '#ffffff' },
  ];

  const fonts: { id: SlideFont; name: string; preview: string }[] = [
    { id: 'sans', name: 'Moderno (Sans)', preview: 'Abc' },
    { id: 'serif', name: 'Clássico (Serif)', preview: 'Abc' },
    { id: 'mono', name: 'Código (Mono)', preview: 'Abc' },
    { id: 'display', name: 'Impacto (Display)', preview: 'Abc' },
    { id: 'handwritten', name: 'Manuscrito', preview: 'Abc' },
    { id: 'times', name: 'Acadêmico (Times)', preview: 'Abc' },
  ];

  const tools = [
    { id: 'select', icon: MousePointer2, title: 'Selecionar' },
    { id: 'text', icon: Type, onClick: () => addElement('text'), title: 'Adicionar Texto' },
    { id: 'image', icon: ImageIcon, onClick: () => addElement('image'), title: 'Adicionar Imagem' },
    { id: 'rect', icon: Square, onClick: () => addElement('rect'), title: 'Adicionar Retângulo' },
    { id: 'circle', icon: Circle, onClick: () => addElement('circle'), title: 'Adicionar Círculo' },
    { id: 'bg-color', icon: PaintBucket, type: 'color', title: 'Cor do Fundo do Slide' },
    { id: 'layers', icon: Layers, onClick: onToggleLayers, title: 'Camadas' },
    { 
      id: 'theme', 
      icon: Palette, 
      onClick: () => {
        setIsThemeOpen(!isThemeOpen);
        setIsFontOpen(false);
      },
      title: 'Temas do Slide'
    },
    { 
      id: 'font', 
      icon: ALargeSmall, 
      onClick: () => {
        setIsFontOpen(!isFontOpen);
        setIsThemeOpen(false);
      },
      title: 'Fonte Global'
    },
    { 
      id: 'ai', 
      icon: Sparkles, 
      className: 'ai-sparkle',
      onClick: onOpenAiModal,
      title: 'Gerar com IA'
    },
    { id: 'settings', icon: Settings, onClick: onOpenSettings, title: 'Configurações' },
  ];

  return (
    <div className="toolbar">
      {tools.map((tool: any) => (
        <div 
          key={tool.id} 
          className={`
            ${tool.id === 'ai' ? 'ai-generation-control' : ''} 
            ${tool.id === 'theme' ? 'theme-picker-container' : ''}
            ${tool.id === 'font' ? 'font-picker-container' : ''}
            ${tool.id === 'bg-color' ? 'bg-color-picker-container' : ''}
          `}
        >
          {tool.type === 'color' ? (
            <div className="tool-btn-container" style={{ position: 'relative' }}>
                <button className="tool-btn" title={tool.title}>
                    <tool.icon size={20} />
                </button>
                <input 
                    type="color" 
                    onChange={(e) => updateSlide(activeSlideId, { backgroundColor: e.target.value })}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        opacity: 0,
                        cursor: 'pointer',
                        width: '100%',
                        height: '100%'
                    }}
                    title={tool.title}
                />
            </div>
          ) : (
            <button 
              className={`tool-btn ${activeTool === tool.id ? 'active' : ''} ${tool.className || ''}`}
              onClick={tool.onClick ? tool.onClick : () => setActiveTool(tool.id)}
              title={tool.title}
            >
              <tool.icon size={20} />
            </button>
          )}

          {tool.id === 'theme' && isThemeOpen && (
            <div className="theme-dropdown">
              {themes.map(t => (
                <div 
                  key={t.id} 
                  className={`theme-option ${activeTheme === t.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTheme(t.id);
                    setIsThemeOpen(false);
                  }}
                >
                  <div className="theme-preview" style={{ background: t.preview }}></div>
                  <span className="theme-name">{t.name}</span>
                </div>
              ))}
            </div>
          )}

          {tool.id === 'font' && isFontOpen && (
            <div className="font-dropdown">
              {fonts.map(f => (
                <div 
                  key={f.id} 
                  className={`font-option ${activeFont === f.id ? 'active' : ''} font-${f.id}`}
                  onClick={() => {
                    setActiveFont(f.id);
                    setIsFontOpen(false);
                  }}
                >
                  <span>{f.name}</span>
                  <span className="font-preview">{f.preview}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
