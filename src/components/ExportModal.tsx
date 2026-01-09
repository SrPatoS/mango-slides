import { useState } from "react";
import { motion } from "framer-motion";
import { X, Download, FileText, Presentation, ChevronDown } from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (type: 'pdf' | 'pptx') => void;
}

export const ExportModal = ({ isOpen, onClose, onExport }: ExportModalProps) => {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'pptx'>('pdf'); // Default para PDF

  if (!isOpen) return null;

  const handleConfirm = () => {
    onExport(selectedFormat);
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--bg-main)',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none', // Remove native arrow
    backgroundImage: 'none'
  } as const;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <motion.div 
        className="settings-modal" 
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        style={{ maxWidth: '400px', padding: 0, overflow: 'visible' }}
      >
        <div className="settings-header" style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <Download size={18} />
            </div>
            <h2 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 600, margin: 0 }}>
              Exportar
            </h2>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="settings-content" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: 500, 
                color: 'var(--text-secondary)',
                fontSize: '0.9rem'
            }}>
                Formato do arquivo
            </label>
            
            <div style={{ position: 'relative' }}>
                <select 
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value as 'pdf' | 'pptx')}
                    style={inputStyle}
                >
                    <option value="pdf">📄 PDF Document (Somente Leitura)</option>
                    <option value="pptx">📊 PowerPoint Presentation (Editável)</option>
                </select>
                <div style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: 'var(--text-secondary)'
                }}>
                    <ChevronDown size={16} />
                </div>
            </div>

            <p style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                {selectedFormat === 'pdf' 
                    ? "O formato PDF é ideal para compartilhamento rápido e impressão, garantindo que o layout permaneça inalterado."
                    : "O formato PowerPoint permite que você continue editando os slides no Microsoft PowerPoint ou Google Slides."
                }
            </p>
          </div>
        </div>

        <div className="settings-footer" style={{ 
          padding: '16px 24px', 
          background: 'var(--bg-main)', 
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <button 
            onClick={onClose}
            className="secondary-button"
            style={{ width: 'auto', padding: '8px 16px' }}
          >
            Cancelar
          </button>
          <button 
            onClick={handleConfirm}
            className="primary-button"
            style={{ 
              width: 'auto', 
              padding: '8px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Download size={16} />
            Exportar
          </button>
        </div>
      </motion.div>
    </div>
  );
};
