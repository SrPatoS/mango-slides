import { Slide } from "../types";

interface CanvasProps {
  activeSlide: Slide;
  updateSlide: (id: string, updates: Partial<Slide>) => void;
  theme: string;
  font: string;
}

export const Canvas = ({ activeSlide, updateSlide, theme, font }: CanvasProps) => {
  return (
    <div className={`slide-canvas theme-${theme} font-${font}`}>
      <div className="slide-content">
        <textarea 
          className="slide-title"
          value={activeSlide.title}
          onChange={(e) => updateSlide(activeSlide.id, { title: e.target.value })}
          placeholder="Título do Slide"
        />
        <textarea 
          className="slide-subtitle"
          value={activeSlide.subtitle}
          onChange={(e) => updateSlide(activeSlide.id, { subtitle: e.target.value })}
          placeholder="Adicione um subtítulo ou conteúdo aqui..."
        />
      </div>
    </div>
  );
};
