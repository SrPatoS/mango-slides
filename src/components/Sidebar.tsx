import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Slide } from "../types";

interface SidebarProps {
  slides: Slide[];
  activeSlideId: string;
  onSlideSelect: (id: string) => void;
  onAddSlide: () => void;
  onDeleteSlide: (id: string, e: React.MouseEvent) => void;
  onDuplicateSlide?: (id: string) => void;
  onReorderSlides?: (fromIndex: number, toIndex: number) => void;
}

export const Sidebar = ({ 
  slides, 
  activeSlideId, 
  onSlideSelect, 
  onAddSlide, 
  onDeleteSlide
}: SidebarProps) => {
  const renderSlidePreview = (slide: Slide) => {
    const canvasWidth = 1000;
    const canvasHeight = 600;
    const scale = 0.12; // Escala para caber no thumbnail
    
    return (
      <div style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: slide.backgroundColor || '#1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: `${canvasWidth * scale}px`,
          height: `${canvasHeight * scale}px`,
          position: 'relative'
        }}>
          {slide.elements.map(el => (
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
                  color: el.color || '#ffffff',
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
          ))}
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
