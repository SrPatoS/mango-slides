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
  Type as FontIcon
} from "lucide-react";
import { SlideTheme, SlideFont } from "../types";

interface ToolbarProps {
  activeTool: string;
  setActiveTool: (tool: string) => void;
  activeTheme: SlideTheme;
  setActiveTheme: (theme: SlideTheme) => void;
  activeFont: SlideFont;
  setActiveFont: (font: SlideFont) => void;
  addElement: (type: 'text' | 'rect' | 'circle' | 'image') => void;
  onOpenAiModal: () => void;
  onOpenSettings: () => void;
}

export const Toolbar = ({ 
  activeTool, 
  setActiveTool, 
  activeTheme,
  setActiveTheme,
  activeFont,
  setActiveFont,
  addElement,
  onOpenAiModal, 
  onOpenSettings 
}: ToolbarProps) => {
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isFontOpen, setIsFontOpen] = useState(false);

  const themes: { id: SlideTheme; name: string; preview: string }[] = [
    { id: 'light', name: 'Claro', preview: '#ffffff' },
    { id: 'dark', name: 'Escuro', preview: '#18181b' },
    { id: 'corporate', name: 'Executivo', preview: 'linear-gradient(135deg, #1e3a8a, #1e40af)' },
    { id: 'purple', name: 'Criativo', preview: 'linear-gradient(135deg, #4c1d95, #6d28d9)' },
    { id: 'minimal', name: 'Mínimo', preview: '#f4f4f5' },
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
    { id: 'select', icon: MousePointer2 },
    { id: 'text', icon: Type, onClick: () => addElement('text') },
    { id: 'image', icon: ImageIcon, onClick: () => addElement('image') },
    { id: 'rect', icon: Square, onClick: () => addElement('rect') },
    { id: 'circle', icon: Circle, onClick: () => addElement('circle') },
    { id: 'layers', icon: Layers },
    { 
      id: 'theme', 
      icon: Palette, 
      onClick: () => {
        setIsThemeOpen(!isThemeOpen);
        setIsFontOpen(false);
      } 
    },
    { 
      id: 'font', 
      icon: FontIcon, 
      onClick: () => {
        setIsFontOpen(!isFontOpen);
        setIsThemeOpen(false);
      } 
    },
    { 
      id: 'ai', 
      icon: Sparkles, 
      className: 'ai-sparkle',
      onClick: onOpenAiModal
    },
    { id: 'settings', icon: Settings, onClick: onOpenSettings },
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
          `}
        >
          <button 
            className={`tool-btn ${activeTool === tool.id ? 'active' : ''} ${tool.className || ''}`}
            onClick={tool.onClick ? tool.onClick : () => setActiveTool(tool.id)}
          >
            <tool.icon size={20} />
          </button>

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
