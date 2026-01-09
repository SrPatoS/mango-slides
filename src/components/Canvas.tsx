import { motion, useDragControls } from "framer-motion";
import { Slide, SlideElement } from "../types";
import { Trash2, Bold, Italic, GripVertical, ArrowUp, ArrowDown, ImageUp, AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react";
import { useEffect, useState, useRef } from "react";

interface CanvasProps {
  activeSlide: Slide;
  activeTool: string;
  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;
  updateSlide: (id: string, updates: Partial<Slide>) => void;
  updateElement: (slideId: string, elementId: string, updates: Partial<any>) => void;
  moveElement: (slideId: string, elementId: string, direction: 'forward' | 'backward' | 'front' | 'back') => void;
  deleteElement: (slideId: string, elementId: string) => void;
  theme: string;
  font: string;
}

// Sub-component for each element's visual part (clipped)
const ElementVisual = ({ el }: { el: SlideElement }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: el.x,
        top: el.y,
        width: el.width || 'auto',
        height: el.height || 'auto',
        padding: '4px',
        boxSizing: 'border-box',
        display: 'flex',
        pointerEvents: 'none'
      }}
    >
      {el.type === 'text' && (
        <div style={{
          fontSize: el.fontSize ? `${el.fontSize}px` : 'inherit',
          fontWeight: el.fontWeight || 'normal',
          fontStyle: el.fontStyle || 'normal',
          width: '100%',
          height: '100%',
          textAlign: (el as any).textAlign || 'left',
          padding: '10px',
          color: el.color || 'inherit',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          lineHeight: 1.2,
          fontFamily: 'inherit'
        }}>
          {el.content}
        </div>
      )}

      {(el.type === 'rect' || el.type === 'circle') && (
        <div style={{ 
          width: '100%', 
          height: '100%', 
          backgroundColor: el.color || '#8b5cf6',
          borderRadius: el.type === 'circle' ? '50%' : '8px',
          transition: 'background-color 0.2s ease'
        }} />
      )}

      {el.type === 'image' && (
        <img 
          src={el.content} 
          alt="" 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'contain',
            pointerEvents: 'none',
            userSelect: 'none'
          }} 
        />
      )}
    </div>
  );
};

// Sub-component for each element's interaction part (not clipped)
const ElementControls = ({ 
  el, 
  activeSlideId,
  activeTool, 
  isSelected, 
  onSelect, 
  updateElement, 
  moveElement,
  deleteElement 
}: { 
  el: SlideElement, 
  activeSlideId: string,
  activeTool: string, 
  isSelected: boolean, 
  onSelect: () => void,
  updateElement: any,
  moveElement: any,
  deleteElement: any
}) => {
  const dragControls = useDragControls();
  const [isResizing, setIsResizing] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const isNearTop = el.y < 80;

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
        zIndex: isSelected ? 100 : 10,
        padding: '4px',
        border: isSelected ? '2px solid var(--accent)' : '1px solid transparent',
        borderRadius: '4px',
        boxSizing: 'border-box',
        display: 'flex',
        cursor: activeTool === 'select' ? (isSelected ? 'default' : 'grab') : 'text',
        pointerEvents: 'auto'
      }}
    >
      {/* Property Bar & Handles - Visible outside clip */}
      {isSelected && activeTool === 'select' && (
        <>
          {/* Drag Handle */}
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
                color: 'var(--accent)',
                cursor: 'grab',
                backgroundColor: '#1e1e20',
                borderRadius: '4px',
                padding: '4px',
                display: 'flex',
                border: '1px solid #3f3f46',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }}
          >
            <GripVertical size={16} />
          </div>

          {/* Property Bar */}
          <div 
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              ...(isNearTop 
                ? { top: '100%', marginTop: '15px' } 
                : { bottom: '100%', marginBottom: '15px' }
              ),
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
              zIndex: 1000,
              pointerEvents: 'auto',
              whiteSpace: 'nowrap'
            }}
          >
            {el.type === 'text' ? (
              <>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    updateElement(activeSlideId, el.id, { fontWeight: el.fontWeight === 'bold' ? 'normal' : 'bold' }); 
                  }}
                  title="Negrito"
                  style={{ background: 'none', border: 'none', color: el.fontWeight === 'bold' ? 'var(--accent)' : 'white', cursor: 'pointer', display: 'flex' }}
                >
                  <Bold size={18} />
                </button>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    updateElement(activeSlideId, el.id, { fontStyle: el.fontStyle === 'italic' ? 'normal' : 'italic' }); 
                  }}
                  title="Itálico"
                  style={{ background: 'none', border: 'none', color: el.fontStyle === 'italic' ? 'var(--accent)' : 'white', cursor: 'pointer', display: 'flex' }}
                >
                  <Italic size={18} />
                </button>
                <div style={{ width: '1px', height: '24px', backgroundColor: '#3f3f46' }} />
                {/* Text Alignment */}
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    updateElement(activeSlideId, el.id, { textAlign: 'left' }); 
                  }}
                  title="Alinhar à esquerda"
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: (el as any).textAlign === 'left' || !(el as any).textAlign ? 'var(--accent)' : 'white', 
                    cursor: 'pointer', 
                    display: 'flex' 
                  }}
                >
                  <AlignLeft size={18} />
                </button>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    updateElement(activeSlideId, el.id, { textAlign: 'center' }); 
                  }}
                  title="Centralizar"
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: (el as any).textAlign === 'center' ? 'var(--accent)' : 'white', 
                    cursor: 'pointer', 
                    display: 'flex' 
                  }}
                >
                  <AlignCenter size={18} />
                </button>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    updateElement(activeSlideId, el.id, { textAlign: 'right' }); 
                  }}
                  title="Alinhar à direita"
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: (el as any).textAlign === 'right' ? 'var(--accent)' : 'white', 
                    cursor: 'pointer', 
                    display: 'flex' 
                  }}
                >
                  <AlignRight size={18} />
                </button>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    updateElement(activeSlideId, el.id, { textAlign: 'justify' }); 
                  }}
                  title="Justificar"
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: (el as any).textAlign === 'justify' ? 'var(--accent)' : 'white', 
                    cursor: 'pointer', 
                    display: 'flex' 
                  }}
                >
                  <AlignJustify size={18} />
                </button>
                <div style={{ width: '1px', height: '24px', backgroundColor: '#3f3f46' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#a1a1aa' }}>Cor</span>
                    <input 
                        type="color" 
                        value={el.color || '#ffffff'} 
                        onMouseDown={(e) => e.stopPropagation()}
                        onChange={(e) => updateElement(activeSlideId, el.id, { color: e.target.value })}
                        style={{ width: '24px', height: '24px', background: 'none', border: '1px solid #3f3f46', cursor: 'pointer', padding: 0, borderRadius: '4px' }}
                    />
                </div>
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
            ) : el.type === 'image' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (ev: any) => {
                                const file = ev.target.files[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                    updateElement(activeSlideId, el.id, { content: event.target?.result as string });
                                };
                                reader.readAsDataURL(file);
                            };
                            input.click();
                        }}
                        title="Trocar Imagem"
                        style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                    >
                        <ImageUp size={18} />
                        Trocar Imagem
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#a1a1aa' }}>Cor do Fundo</span>
                    <input 
                        type="color" 
                        value={el.color || '#8b5cf6'} 
                        onMouseDown={(e) => e.stopPropagation()}
                        onChange={(e) => updateElement(activeSlideId, el.id, { color: e.target.value })}
                        style={{ width: '24px', height: '24px', background: 'none', border: '1px solid #3f3f46', cursor: 'pointer', padding: 0, borderRadius: '4px' }}
                    />
                </div>
            )}

            <div style={{ width: '1px', height: '24px', backgroundColor: '#3f3f46' }} />
            
            {/* Layer Controls */}
            <div style={{ display: 'flex', gap: '4px' }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); moveElement(activeSlideId, el.id, 'forward'); }}
                  title="Trazer para frente"
                  style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', padding: '4px' }}
                >
                  <ArrowUp size={18} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); moveElement(activeSlideId, el.id, 'backward'); }}
                  title="Enviar para trás"
                  style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', padding: '4px' }}
                >
                  <ArrowDown size={18} />
                </button>
            </div>

            <div style={{ width: '1px', height: '24px', backgroundColor: '#3f3f46' }} />

            <button 
              onClick={(e) => {
                e.stopPropagation();
                deleteElement(activeSlideId, el.id);
              }}
              title="Excluir"
              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex' }}
            >
              <Trash2 size={18} />
            </button>
          </div>

          {/* Resize Handle */}
          <div 
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setIsResizing(true);
              const startX = e.clientX;
              const startY = e.clientY;
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
              backgroundColor: 'var(--accent)',
              border: '3px solid white',
              borderRadius: '50%',
              cursor: 'nwse-resize',
              zIndex: 110,
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
            }}
          />
        </>
      )}

      {/* Editable Area (only for text and only when selected/clicking) */}
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
            color: 'transparent', // Text is rendered by Visual layer
            caretColor: el.color || '#ffffff',
            fontFamily: 'inherit',
            position: 'relative',
            zIndex: 1
          }}
        />
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
  moveElement,
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
      style={{ 
        background: activeSlide.backgroundColor || 'var(--theme-bg, #ffffff)', 
        overflow: 'visible' 
      }}
    >
      {/* Theme Background Decoration Layer */}
      <div className="theme-backdrop" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }} />
      {/* 1. VISUAL LAYER (CLIPPED) */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        overflow: 'hidden', 
        borderRadius: '4px',
        pointerEvents: 'none',
        zIndex: 5
      }}>
        <div className="slide-content-area" style={{ position: 'relative', width: '100%', height: '100%' }}>
          {activeSlide.elements.map((el) => (
            <ElementVisual key={el.id} el={el} />
          ))}
        </div>
      </div>

      {/* 2. INTERACTION LAYER (NOT CLIPPED) */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        zIndex: 10,
        pointerEvents: 'none'
      }}>
        {activeSlide.elements.map((el) => (
          <ElementControls 
            key={el.id}
            el={el}
            activeSlideId={activeSlide.id}
            activeTool={activeTool}
            isSelected={selectedElementId === el.id}
            onSelect={() => setSelectedElementId(el.id)}
            updateElement={updateElement}
            moveElement={moveElement}
            deleteElement={deleteElement}
          />
        ))}
      </div>
    </div>
  );
};
