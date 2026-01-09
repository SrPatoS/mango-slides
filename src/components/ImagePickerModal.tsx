import { useState } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string) => void;
  unsplashKey?: string;
}

export const ImagePickerModal = ({ isOpen, onClose, onSelect, unsplashKey }: ImagePickerModalProps) => {
  const [query, setQuery] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchImages = async () => {
    if (!query) return;
    setLoading(true);
    setError('');
    
    // Mock se não tiver chave (usando Lorem Picsum com seeds baseadas na query)
    if (!unsplashKey) {
        setTimeout(() => {
            const mockImages = Array.from({ length: 12 }).map((_, i) => 
                `https://picsum.photos/seed/${query}${i}${Date.now()}/600/400`
            );
            setImages(mockImages);
            setLoading(false);
        }, 800);
        return;
    }

    try {
        const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=12&orientation=landscape`, {
            headers: {
                Authorization: `Client-ID ${unsplashKey}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Erro na API Unsplash');
        }

        const data = await response.json();
        if (data.results) {
            setImages(data.results.map((r: any) => r.urls.regular));
        } else {
            setError('Nenhuma imagem encontrada.');
        }
    } catch (err) {
        console.error(err);
        setError('Erro ao buscar imagens. Verifique sua API Key.');
    } finally {
        setLoading(false);
    }
  };

  if(!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="modal-overlay"
        style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            zIndex: 1000, 
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)'
        }}
      >
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0, scale: 0.95 }}
           className="modal-content"
           style={{ 
               maxWidth: '800px', 
               width: '90%', 
               height: '80vh',
               background: 'var(--bg-sidebar)', 
               borderRadius: '12px', 
               padding: '24px',
               boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
               display: 'flex',
               flexDirection: 'column',
               color: 'var(--text-primary)'
           }}
        >
          <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Buscar Imagens</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={24} /></button>
          </div>

          <div className="search-bar" style={{ display: 'flex', gap: '10px', marginBottom: '20px', width: '100%' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                  <input 
                     value={query} 
                     onChange={e => setQuery(e.target.value)} 
                     onKeyDown={e => e.key === 'Enter' && searchImages()}
                     placeholder="Digite um tema (ex: tecnologia, natureza, escritório)..."
                     style={{
                         width: '100%',
                         padding: '12px 12px 12px 40px',
                         borderRadius: '8px',
                         border: '1px solid #3f3f46',
                         background: '#18181b', // Dark background explicit
                         color: '#f3f4f6', // Light text explicit
                         fontSize: '1rem',
                         outline: 'none',
                         height: '48px',
                         boxSizing: 'border-box'
                     }}
                     autoFocus
                  />
              </div>
              <button 
                onClick={searchImages}
                disabled={loading || !query}
                style={{
                    padding: '0 24px',
                    height: '48px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    background: 'var(--accent)',
                    color: 'white',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
              >
                  {loading ? '...' : 'Buscar'}
              </button>
          </div>

          {!unsplashKey && !loading && images.length > 0 && (
             <div style={{ padding: '8px 12px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '6px', marginBottom: '16px', color: '#fbbf24', fontSize: '0.9rem' }}>
                 ⚠️ <strong>Modo Demo:</strong> Imagens geradas aleatoriamente (Lorem Picsum). Adicione sua <strong>Unsplash Access Key</strong> nas Configurações para buscar imagens reais.
             </div>
          )}

          {error && (
              <div style={{ color: 'var(--danger)', textAlign: 'center', padding: '20px' }}>{error}</div>
          )}

          <div className="image-grid" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
              gap: '16px', 
              overflowY: 'auto',
              flex: 1,
              paddingRight: '8px'
          }}>
              {loading && (
                  <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'center', padding: '40px', color: 'var(--accent)' }}>
                      <Loader2 size={32} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                  </div>
              )}
              
              {!loading && images.length === 0 && !error && (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>
                      Digite algo para buscar imagens incríveis.
                  </div>
              )}

              {images.map((url, i) => (
                  <div 
                    key={i} 
                    className="image-card"
                    onClick={() => { onSelect(url); onClose(); }}
                    style={{ 
                        borderRadius: '8px', 
                        overflow: 'hidden', 
                        cursor: 'pointer', 
                        border: '2px solid transparent',
                        transition: 'all 0.2s',
                        height: '150px',
                        position: 'relative',
                        background: '#1e1e20'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                  >
                      <img 
                        src={url} 
                        alt="Resultado" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        loading="lazy"
                      />
                  </div>
              ))}
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
