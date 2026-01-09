import { motion, useDragControls } from "framer-motion";
import { Slide, SlideElement } from "../types";
import { Trash2, Bold, Italic, GripVertical } from "lucide-react";
import { useEffect, useState, useRef } from "react";

interface CanvasProps {
  activeSlide: Slide;
  activeTool: string;
  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;
  updateSlide: (id: string, updates: Partial<Slide>) => void;
  updateElement: (slideId: string, elementId: string, updates: Partial<any>) => void;
  deleteElement: (slideId: string, elementId: string) => void;
  theme: string;
  font: string;
}

const DraggableElement = ({ 
  el, 
  activeSlideId,
  activeTool, 
  isSelected, 
  onSelect, 
  updateElement, 
  deleteElement 
}: { 
  el: SlideElement, 
  activeSlideId: string,
  activeTool: string, 
  isSelected: boolean, 
  onSelect: () => void,
  updateElement: any,
  deleteElement: any
}) => {
  const dragControls = useDragControls();
  const [isResizing, setIsResizing] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={elementRef}
      drag={activeTool === 'select' && !isResizing}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      onDragEnd={(_, info) => {
        updateElement(activeSlideId, el.id, { 
          x: el.x + info.offset.x, 
          y: el.y + info.offset.y 
        });
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      initial={false}
      animate={{ 
        x: el.x, 
        y: el.y, 
        width: el.width || 'auto', 
        height: el.height || 'auto' 
      }}
      transition={{ duration: 0 }}
      style={{ 
        position: 'absolute',
        zIndex: isSelected ? 20 : 10,
        padding: '4px',
        border: isSelected ? '2px solid #8b5cf6' : '1px solid transparent',
        borderRadius: '4px',
        boxSizing: 'border-box',
        display: 'flex',
        cursor: activeTool === 'select' ? 'default' : 'text'
      }}
    >
      {isSelected && activeTool === 'select' && (
        <>
          <div 
            onPointerDown={(e) => {
                e.stopPropagation();
                dragControls.start(e);
            }}
            style={{ 
                position: 'absolute', 
                left: -28, 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#8b5cf6',
                cursor: 'grab',
                backgroundColor: '#1e1e20',
                borderRadius: '4px',
                padding: '4px',
                display: 'flex',
                border: '1px solid #3f3f46'
            }}
          >
            <GripVertical size={16} />
          </div>

          <div 
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: -65,
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#1e1e20',
              border: '1px solid #3f3f46',
              borderRadius: '8px',
              padding: '8px 12px',
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              zIndex: 100,
            }}
          >
            {el.type === 'text' && (
              <>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    updateElement(activeSlideId, el.id, { fontWeight: el.fontWeight === 'bold' ? 'normal' : 'bold' }); 
                  }}
                  style={{ background: 'none', border: 'none', color: el.fontWeight === 'bold' ? '#8b5cf6' : 'white', cursor: 'pointer', display: 'flex' }}
                >
                  <Bold size={18} />
                </button>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    updateElement(activeSlideId, el.id, { fontStyle: el.fontStyle === 'italic' ? 'normal' : 'italic' }); 
                  }}
                  style={{ background: 'none', border: 'none', color: el.fontStyle === 'italic' ? '#8b5cf6' : 'white', cursor: 'pointer', display: 'flex' }}
                >
                  <Italic size={18} />
                </button>
                <div style={{ width: '1px', height: '24px', backgroundColor: '#3f3f46' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#a1a1aa' }}>Tam.</span>
                    <input 
                        type="number" 
                        value={el.fontSize || 24} 
                        onMouseDown={(e) => e.stopPropagation()}
                        onChange={(e) => updateElement(activeSlideId, el.id, { fontSize: parseInt(e.target.value) || 12 })}
                        style={{ width: '50px', background: '#09090b', border: '1px solid #3f3f46', color: 'white', fontSize: '13px', borderRadius: '4px', padding: '4px 6px' }}
                    />
                </div>
              </>
            )}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                deleteElement(activeSlideId, el.id);
              }}
              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex' }}
            >
              <Trash2 size={18} />
            </button>
          </div>

          <div 
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setIsResizing(true);
              
              const startX = e.clientX;
              const startY = e.clientY;
              
              // Key fix: use actual rendered size if state width/height are auto
              const currentRect = elementRef.current?.getBoundingClientRect();
              const startWidth = currentRect ? currentRect.width : (el.width || 150);
              const startHeight = currentRect ? currentRect.height : (el.height || 100);

              const onMouseMove = (moveEvent: MouseEvent) => {
                const newWidth = Math.max(50, startWidth + (moveEvent.clientX - startX));
                const newHeight = Math.max(30, startHeight + (moveEvent.clientY - startY));
                updateElement(activeSlideId, el.id, { width: newWidth, height: newHeight });
              };

              const onMouseUp = () => {
                setIsResizing(false);
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
              };

              document.addEventListener('mousemove', onMouseMove);
              document.addEventListener('mouseup', onMouseUp);
            }}
            style={{
              position: 'absolute',
              right: -8,
              bottom: -8,
              width: 14,
              height: 14,
              backgroundColor: '#8b5cf6',
              border: '3px solid white',
              borderRadius: '50%',
              cursor: 'nwse-resize',
              zIndex: 110,
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
            }}
          />
        </>
      )}

      {el.type === 'text' && (
        <textarea
          className={el.fontSize && el.fontSize > 30 ? "slide-title" : "slide-subtitle"}
          value={el.content}
          onChange={(e) => updateElement(activeSlideId, el.id, { content: e.target.value })}
          onMouseDown={(e) => {
            if (activeTool === 'select' && isSelected) {
                e.stopPropagation();
            }
          }}
          style={{ 
            fontSize: el.fontSize ? `${el.fontSize}px` : 'inherit',
            fontWeight: el.fontWeight || 'normal',
            fontStyle: el.fontStyle || 'normal',
            margin: 0,
            width: '100%',
            height: '100%',
            textAlign: 'left',
            padding: '10px',
            border: 'none',
            background: 'transparent',
            outline: 'none',
            resize: 'none',
            cursor: activeTool === 'select' ? (isSelected ? 'text' : 'grab') : 'text',
            pointerEvents: activeTool === 'select' && !isSelected ? 'none' : 'auto',
            color: 'inherit',
            fontFamily: 'inherit',
            minHeight: '1.2em'
          }}
        />
      )}

      {(el.type === 'rect' || el.type === 'circle') && (
        <div style={{ 
          width: '100%', 
          height: '100%', 
          backgroundColor: el.color || '#8b5cf6',
          borderRadius: el.type === 'circle' ? '50%' : '8px',
          pointerEvents: 'none'
        }} />
      )}
    </motion.div>
  );
};

export const Canvas = ({ 
  activeSlide, 
  activeTool, 
  selectedElementId,
  setSelectedElementId,
  updateElement, 
  deleteElement,
  theme, 
  font 
}: CanvasProps) => {
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {
        if (document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.tagName === 'INPUT') {
          return;
        }
        deleteElement(activeSlide.id, selectedElementId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, activeSlide.id, deleteElement]);

  return (
    <div 
      className={`slide-canvas theme-${theme} font-${font}`}
      onMouseDown={() => setSelectedElementId(null)}
      style={{ overflow: 'hidden' }}
    >
      <div className="slide-content-area" style={{ position: 'relative', width: '100%', height: '100%' }}>
        {activeSlide.elements.map((el: SlideElement) => (
          <DraggableElement 
            key={el.id}
            el={el}
            activeSlideId={activeSlide.id}
            activeTool={activeTool}
            isSelected={selectedElementId === el.id}
            onSelect={() => setSelectedElementId(el.id)}
            updateElement={updateElement}
            deleteElement={deleteElement}
          />
        ))}
      </div>
    </div>
  );
};
