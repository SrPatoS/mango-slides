import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Slide, SlideTheme } from "../types";

interface SidebarProps {
  slides: Slide[];
  activeSlideId: string;
  activeTheme: SlideTheme;
  onSlideSelect: (id: string) => void;
  onAddSlide: () => void;
  onDeleteSlide: (id: string, e: React.MouseEvent) => void;
  onDuplicateSlide?: (id: string) => void;
  onReorderSlides?: (fromIndex: number, toIndex: number) => void;
}

export const Sidebar = ({ 
  slides, 
  activeSlideId, 
  activeTheme,
  onSlideSelect, 
  onAddSlide, 
  onDeleteSlide
}: SidebarProps) => {

  const getThemeBackground = (theme: SlideTheme) => {
    switch (theme) {
      case 'light': return '#f8fafc';
      case 'dark': return '#0f172a';
      case 'corporate': return 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
      case 'purple': return 'linear-gradient(135deg, #4c1d95 0%, #1e1b4b 100%)';
      case 'minimal': return '#ffffff';
      default: return '#ffffff';
    }
  };

  // Determine default text color if element color is not specific or is variable-like
  const getThemeTextColor = (theme: SlideTheme) => {
      switch (theme) {
          case 'light': return '#0f172a';
          case 'dark': return '#f8fafc';
          case 'corporate': return '#ffffff';
          case 'purple': return '#ffffff';
          case 'minimal': return '#18181b';
          default: return '#000000';
      }
  };

  const renderSlidePreview = (slide: Slide) => {
    const canvasWidth = 1000;
    const canvasHeight = 600;
    const scale = 0.12; // Escala para caber no thumbnail
    
    const themeBg = getThemeBackground(activeTheme);
    const themeText = getThemeTextColor(activeTheme);

    return (
      <div style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: slide.backgroundColor || themeBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderLeft: activeTheme === 'minimal' ? '4px solid #0f172a' : 'none'
      }}>
        <div style={{
          width: `${canvasWidth * scale}px`,
          height: `${canvasHeight * scale}px`,
          position: 'relative'
        }}>
          {slide.elements.map(el => {
             // Handle 'var(--theme-text)' logic simply for preview
             let elColor = el.color;
             if (!elColor || elColor === 'var(--theme-text)') {
                 elColor = themeText;
             }

             return (
                <div
                key={el.id}
                style={{
                    position: 'absolute',
                    left: `${el.x * scale}px`,
                    top: `${el.y * scale}px`,
                    width: el.width ? `${el.width * scale}px` : 'auto',
                    height: el.height ? `${el.height * scale}px` : 'auto',
                    pointerEvents: 'none'
                }}
                >
                {el.type === 'text' && (
                    <div style={{
                    fontSize: `${(el.fontSize || 24) * scale}px`,
                    fontWeight: el.fontWeight || 'normal',
                    fontStyle: el.fontStyle || 'normal',
                    color: elColor,
                    textAlign: (el as any).textAlign || 'left',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    lineHeight: 1.2
                    }}>
                    {el.content}
                    </div>
                )}
                {el.type === 'rect' && (
                    <div style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: el.color || '#8b5cf6',
                    borderRadius: '8px'
                    }} />
                )}
                {el.type === 'circle' && (
                    <div style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: el.color || '#8b5cf6',
                    borderRadius: '50%'
                    }} />
                )}
                {el.type === 'image' && el.content && (
                    <img 
                    src={el.content} 
                    alt="" 
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                    }}
                    />
                )}
                </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Meus Slides</h2>
      </div>
      
      <div className="slide-list">
        {slides.map((slide, index) => (
          <div 
            key={slide.id} 
            className={`slide-thumb ${activeSlideId === slide.id ? "active" : ""}`}
            onClick={() => onSlideSelect(slide.id)}
            style={{
                borderColor: activeSlideId === slide.id ? 'var(--accent)' : 'transparent',
                // For minimal theme, we might want a border to distinguish white slide from white sidebar background?
                // Assuming sidebar background is distinct enough managed by App.css
            }}
          >
            <span className="slide-thumb-number">{index + 1}</span>
            {slides.length > 1 && (
              <button 
                className="delete-slide-btn" 
                onClick={(e) => onDeleteSlide(slide.id, e)}
                title="Excluir slide"
              >
                <Trash2 size={14} />
              </button>
            )}
            {renderSlidePreview(slide)}
          </div>
        ))}
      </div>

      <button className="add-slide-btn btn-secondary" onClick={onAddSlide}>
        <Plus size={20} />
        Novo Slide
      </button>
    </aside>
  );
};
