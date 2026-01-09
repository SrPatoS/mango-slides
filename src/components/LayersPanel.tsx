import { Slide } from "../types";
import { X, Type, Square, Circle as CircleIcon, ChevronUp, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

interface LayersPanelProps {
  activeSlide: Slide;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onMoveElement: (slideId: string, elementId: string, direction: 'forward' | 'backward' | 'front' | 'back') => void;
  onClose: () => void;
}

export const LayersPanel = ({ activeSlide, selectedElementId, onSelectElement, onMoveElement, onClose }: LayersPanelProps) => {

  const elements = [...activeSlide.elements].reverse();

  return (
    <motion.div 
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      style={{
        position: 'absolute',
        right: '24px',
        top: '80px',
        width: '280px',
        backgroundColor: 'var(--bg-sidebar)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'calc(100vh - 120px)',
        overflow: 'hidden'
      }}
    >
      <div style={{
        padding: '16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(var(--accent-rgb, 139, 92, 246), 0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', letterSpacing: '0.02em' }}>Camadas</span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: '4px' }}>
                {activeSlide.elements.length}
            </span>
        </div>
        <button 
            onClick={onClose} 
            style={{ 
                background: 'none', 
                border: 'none', 
                color: 'var(--text-secondary)', 
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex',
                transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <X size={18} />
        </button>
      </div>

      <div style={{ overflowY: 'auto', flex: 1, padding: '12px' }} className="custom-scrollbar">
        {elements.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
            <div style={{ marginBottom: '12px', opacity: 0.5 }}>📭</div>
            Nenhum elemento neste slide
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {elements.map((el, index) => {
              const isSelected = selectedElementId === el.id;
              const isFirst = index === 0;
              const isLast = index === elements.length - 1;

              return (
                <div
                  key={el.id}
                  onClick={() => onSelectElement(el.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: isSelected ? 'rgba(var(--accent-rgb, 139, 92, 246), 0.15)' : 'rgba(var(--text-primary-rgb, 255,255,255), 0.02)',
                    border: isSelected ? '1px solid var(--accent)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                  onMouseOver={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(var(--text-primary-rgb, 255,255,255), 0.05)';
                  }}
                  onMouseOut={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(var(--text-primary-rgb, 255,255,255), 0.02)';
                  }}
                >
                  <div style={{ 
                    color: isSelected ? 'var(--accent)' : 'var(--text-secondary)',
                    display: 'flex'
                  }}>
                    {el.type === 'text' && <Type size={16} />}
                    {el.type === 'rect' && <Square size={16} />}
                    {el.type === 'circle' && <CircleIcon size={16} />}
                  </div>

                  <div style={{ 
                    flex: 1, 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap', 
                    fontSize: '13px', 
                    color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: isSelected ? 500 : 400
                  }}>
                    {el.type === 'text' ? (el.content?.trim() || 'Texto sem conteúdo') : (el.type === 'rect' ? 'Retângulo' : 'Círculo')}
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    gap: '4px',
                    opacity: isSelected ? 1 : 0.4,
                    transition: 'opacity 0.2s'
                  }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); onMoveElement(activeSlide.id, el.id, 'forward'); }}
                      disabled={isFirst}
                      title="Mover para frente"
                      style={{ 
                        background: isFirst ? 'transparent' : 'rgba(var(--text-primary-rgb, 255,255,255), 0.05)', 
                        border: 'none', 
                        color: isFirst ? 'var(--border)' : 'var(--text-primary)', 
                        cursor: isFirst ? 'default' : 'pointer', 
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'flex'
                      }}
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onMoveElement(activeSlide.id, el.id, 'backward'); }}
                      disabled={isLast}
                      title="Mover para trás"
                      style={{ 
                        background: isLast ? 'transparent' : 'rgba(var(--text-primary-rgb, 255,255,255), 0.05)', 
                        border: 'none', 
                        color: isLast ? 'var(--border)' : 'var(--text-primary)', 
                        cursor: isLast ? 'default' : 'pointer', 
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'flex'
                      }}
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ 
        padding: '12px 16px', 
        borderTop: '1px solid var(--border)', 
        backgroundColor: 'rgba(var(--text-primary-rgb, 255,255,255), 0.01)',
        fontSize: '11px',
        color: 'var(--text-secondary)',
        textAlign: 'center'
      }}>
        Arraste elementos para mudar a ordem (Em breve)
      </div>
    </motion.div>
  );
};

