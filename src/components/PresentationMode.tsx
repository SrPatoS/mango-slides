import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Slide, SlideTheme, SlideFont } from '../types';
import { SlideRenderer } from './SlideRenderer';

interface PresentationModeProps {
  slides: Slide[];
  activeTheme: SlideTheme;
  activeFont: SlideFont;
  initialSlideIndex?: number;
  onClose: () => void;
}

export const PresentationMode = ({ slides, activeTheme, activeFont, initialSlideIndex = 0, onClose }: PresentationModeProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialSlideIndex);
  const [scale, setScale] = useState(1);

  // Calcular escala para fit screen
  useEffect(() => {
    const handleResize = () => {
      // Pequena margem para não colar nas bordas
      const w = window.innerWidth * 0.95;
      const h = window.innerHeight * 0.95;
      const baseW = 1000;
      const baseH = 600;
      
      const scaleW = w / baseW;
      const scaleH = h / baseH;
      
      // Manter aspect ratio e caber na tela
      setScale(Math.min(scaleW, scaleH));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Tentar fullscreen
    document.documentElement.requestFullscreen().catch((e) => {
        console.warn("Fullscreen request denied", e);
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      if (document.fullscreenElement) {
         document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        setCurrentIndex(prev => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        // Fullscreen exit via ESC já é nativo, mas precisamos fechar o componente React
        onClose(); 
      }
    };
    
    // Captura de fullscreenchange para detectar se o usuário saiu via ESC nativo
    const handleFullscreenChange = () => {
        if (!document.fullscreenElement) {
            onClose();
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [slides.length, onClose]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: '#000', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      <AnimatePresence mode='wait'>
         <motion.div
           key={currentIndex}
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0, scale: 1.1 }}
           transition={{ duration: 0.5, ease: "anticipate" }}
           style={{ position: 'absolute' }}
         >
             <SlideRenderer 
               slide={slides[currentIndex]} 
               activeTheme={activeTheme}
               activeFont={activeFont}
               scale={scale} 
             />
         </motion.div>
      </AnimatePresence>
      
      {/* Overlay Controls */}
      <div 
        className='presentation-controls'
        style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '12px',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            padding: '10px 20px',
            borderRadius: '100px',
            opacity: 0,
            transition: 'opacity 0.3s',
            zIndex: 10000
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
        onMouseLeave={e => e.currentTarget.style.opacity = '0'}
      >
          <button onClick={() => setCurrentIndex(prev => Math.max(prev - 1, 0))} className='icon-btn'><ChevronLeft color="white" /></button>
          <span style={{ color: 'white', alignSelf: 'center', fontFamily: 'monospace' }}>
            {currentIndex + 1} / {slides.length}
          </span>
          <button onClick={() => setCurrentIndex(prev => Math.min(prev + 1, slides.length - 1))} className='icon-btn'><ChevronRight color="white" /></button>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }} />
          <button onClick={onClose} className='icon-btn' title="Sair (Esc)"><X color="white" /></button>
      </div>

       {/* Invisible click navigation zones */}
       <div 
          style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '20%', cursor: 'none', zIndex: 500 }} 
          onClick={() => setCurrentIndex(prev => Math.max(prev - 1, 0))}
       />
       <div 
          style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '20%', cursor: 'none', zIndex: 500 }} 
          onClick={() => setCurrentIndex(prev => Math.min(prev + 1, slides.length - 1))}
       />

    </motion.div>
  );
};
