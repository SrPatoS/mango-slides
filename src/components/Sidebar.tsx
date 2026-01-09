import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Slide } from "../types";

interface SidebarProps {
  slides: Slide[];
  activeSlideId: string;
  setActiveSlideId: (id: string) => void;
  addSlide: () => void;
  deleteSlide: (id: string, e: React.MouseEvent) => void;
}

export const Sidebar = ({ 
  slides, 
  activeSlideId, 
  setActiveSlideId, 
  addSlide, 
  deleteSlide 
}: SidebarProps) => {
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
          </div>
        ))}
      </div>

      <button className="add-slide-btn btn-secondary" onClick={addSlide}>
        <Plus size={20} />
        Novo Slide
      </button>
    </aside>
  );
};
