import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Slide, SlideTheme } from "../types";
import { SlideRenderer } from "./SlideRenderer";

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

  // renderSlidePreview logic removed, using SlideRenderer directly
  const renderSlidePreview = (slide: Slide) => {
     return (
        <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <SlideRenderer 
                slide={slide} 
                activeTheme={activeTheme} 
                scale={0.12} 
            />
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
