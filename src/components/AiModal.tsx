import { X, Sparkles, HelpCircle, Upload, FileText, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useRef } from "react";
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface AiModalProps {
  isOpen: boolean;
  onClose: () => void;
  isGenerating: boolean;
  aiPrompt: string;
  setAiPrompt: (prompt: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  contentDensity: string;
  setContentDensity: (density: string) => void;
  numSlides: number;
  setNumSlides: (num: number) => void;
  includeQuiz: boolean;
  setIncludeQuiz: (include: boolean) => void;
  numQuizQuestions: number;
  setNumQuizQuestions: (num: number) => void;
  onGenerate: (context?: string) => void;
}

export const AiModal = ({
  isOpen,
  onClose,
  isGenerating,
  aiPrompt,
  setAiPrompt,
  selectedModel,
  setSelectedModel,
  contentDensity,
  setContentDensity,
  numSlides,
  setNumSlides,
  includeQuiz,
  setIncludeQuiz,
  numQuizQuestions,
  setNumQuizQuestions,
  onGenerate
}: AiModalProps) => {
  const [pdfContext, setPdfContext] = useState<string>("");
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [isReadingPdf, setIsReadingPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
        alert('Por favor, selecione apenas arquivos PDF.');
        return;
    }

    setIsReadingPdf(true);
    setPdfFileName(file.name);

    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += `--- Página ${i} ---\n${pageText}\n\n`;
        }

        setPdfContext(fullText);
        console.log("PDF lido com sucesso, caracteres:", fullText.length);

    } catch (error) {
        console.error("Erro ao ler PDF:", error);
        alert("Erro ao ler o arquivo PDF. Verifique se não está corrompido.");
        setPdfFileName(null);
        setPdfContext("");
    } finally {
        setIsReadingPdf(false);
    }
  };

  const clearPdf = () => {
    setPdfFileName(null);
    setPdfContext("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const labelStyle = {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    fontWeight: 500,
    marginBottom: '6px',
    display: 'block'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--bg-main)',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s'
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <motion.div 
        className="settings-modal" 
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        style={{ maxWidth: '520px', overflow: 'visible' }}
      >
        <div className="settings-header" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #ff9a1f 0%, #ff6b3d 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 12px rgba(255, 154, 31, 0.25)'
            }}>
              <Sparkles size={18} />
            </div>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 600, margin: 0 }}>
              Gerar conteúdo com IA
            </h2>
          </div>
          {!isGenerating && (
            <button 
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '6px',
                display: 'flex',
                transition: 'background 0.2s'
              }}
              className="hover:bg-zinc-800"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="settings-content" style={{ padding: '24px', overflowY: 'visible' }}>
          {isGenerating ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '40px 0',
              gap: '20px'
            }}>
               <div style={{
                  width: '48px',
                  height: '48px',
                  border: '3px solid var(--border)',
                  borderTopColor: 'var(--accent)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Criando sua apresentação...
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  A IA está analisando o conteúdo e escrevendo {numSlides} slides...
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Row 1: Settings Grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1.5fr 1fr 0.8fr', 
                gap: '16px' 
              }}>
                <div>
                  <label style={labelStyle}>Modelo</label>
                  <select 
                    style={inputStyle}
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                  >
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Densidade</label>
                  <select 
                    style={inputStyle}
                    value={contentDensity}
                    onChange={(e) => setContentDensity(e.target.value)}
                  >
                    <option value="bullets">Tópicos</option>
                    <option value="low">Resumo</option>
                    <option value="medium">Padrão</option>
                    <option value="high">Detalhe</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Slides</label>
                  <input 
                    type="number" 
                    style={inputStyle}
                    min="1"
                    max="15"
                    value={numSlides}
                    onChange={(e) => setNumSlides(parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>

              {/* Row 2: File Upload (PDF) */}
              <div>
                <label style={labelStyle}>Contexto (Opcional)</label>
                <input 
                    type="file" 
                    ref={fileInputRef}
                    style={{ display: 'none' }} 
                    accept="application/pdf"
                    onChange={handleFileUpload}
                />

                {!pdfFileName ? (
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            border: '1px dashed var(--border)',
                            borderRadius: '8px',
                            padding: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            cursor: 'pointer',
                            color: 'var(--text-secondary)',
                            transition: 'all 0.2s',
                            backgroundColor: isReadingPdf ? 'var(--bg-highlight)' : 'transparent'
                        }}
                        onMouseOver={(e) => {
                             e.currentTarget.style.borderColor = 'var(--accent)';
                             e.currentTarget.style.color = 'var(--text-primary)';
                        }}
                        onMouseOut={(e) => {
                             e.currentTarget.style.borderColor = 'var(--border)';
                             e.currentTarget.style.color = 'var(--text-secondary)';
                        }}
                    >
                        {isReadingPdf ? (
                            <>
                                <div style={{
                                    width: '16px', height: '16px', border: '2px solid currentColor', 
                                    borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s infinite' 
                                }} />
                                Lendo PDF...
                            </>
                        ) : (
                            <>
                                <Upload size={18} />
                                <span style={{ fontSize: '0.9rem' }}>Anexar PDF para referência</span>
                            </>
                        )}
                    </div>
                ) : (
                    <div style={{
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: 'rgba(var(--accent-rgb), 0.05)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                            <div style={{ 
                                background: '#ef4444', 
                                borderRadius: '4px', 
                                padding: '4px',
                                display: 'flex',
                                color: 'white'
                            }}>
                                <FileText size={16} />
                            </div>
                            <span style={{ 
                                fontSize: '0.9rem', 
                                color: 'var(--text-primary)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '300px'
                            }}>
                                {pdfFileName}
                            </span>
                        </div>
                        <button 
                            onClick={clearPdf}
                            style={{ 
                                background: 'transparent', border: 'none', cursor: 'pointer', 
                                color: 'var(--text-secondary)', padding: '4px' 
                            }}
                            title="Remover arquivo"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
              </div>

              {/* Row 3: Quiz Toggle Card */}
              <div style={{
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                      Incluir Questionário
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Adiciona slides de perguntas ao final
                    </span>
                 </div>

                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {includeQuiz && (
                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', animation: 'fadeIn 0.2s' }}>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Qtd:</label>
                            <input 
                              type="number"
                              min="1"
                              max="10"
                              value={numQuizQuestions}
                              onChange={(e) => setNumQuizQuestions(parseInt(e.target.value) || 1)}
                              style={{ ...inputStyle, width: '60px', padding: '6px 8px' }}
                            />
                         </div>
                    )}

                    <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                      <input 
                        type="checkbox" 
                        checked={includeQuiz}
                        onChange={(e) => setIncludeQuiz(e.target.checked)}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span className="slider round" style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: includeQuiz ? 'var(--accent)' : 'var(--border)',
                        transition: '.4s',
                        borderRadius: '34px'
                      }}>
                        <span style={{
                          position: 'absolute',
                          content: "",
                          height: '20px',
                          width: '20px',
                          left: includeQuiz ? '22px' : '2px',
                          bottom: '2px',
                          backgroundColor: 'white',
                          transition: '.4s',
                          borderRadius: '50%'
                        }} />
                      </span>
                    </label>
                 </div>
              </div>

              {/* Row 4: Textarea */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={labelStyle}>Sobre o que é sua apresentação?</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <HelpCircle size={12} />
                        Seja específico para melhores resultados
                    </div>
                </div>
                <textarea 
                  placeholder={pdfFileName ? "Descreva como usar o PDF acima (ex: Resuma os principais pontos do capítulo 3...)" : "Ex: A revolução industrial do século XVIII, focando nas máquinas a vapor e impacto social..."}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  autoFocus
                  style={{
                    ...inputStyle,
                    height: '100px',
                    resize: 'none',
                    lineHeight: '1.5'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
              </div>

            </div>
          )}
        </div>

        <div className="settings-footer" style={{ padding: '20px 24px', background: 'var(--bg-main)', borderTop: '1px solid var(--border)' }}>
          <button 
            className="secondary-button" 
            onClick={onClose} 
            disabled={isGenerating}
            style={{ width: 'auto', padding: '10px 20px' }}
          >
            Cancelar
          </button>
          <button 
            className="primary-button" 
            onClick={() => onGenerate(pdfContext)}
            disabled={isGenerating || (!aiPrompt.trim() && !pdfContext)}
            style={{ 
                width: 'auto', 
                padding: '10px 24px',
                opacity: (isGenerating || (!aiPrompt.trim() && !pdfContext)) ? 0.6 : 1,
                cursor: (isGenerating || (!aiPrompt.trim() && !pdfContext)) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}
          >
            {isGenerating ? (
                <>Gerando...</>
            ) : (
                <>
                    <Sparkles size={18} />
                    Gerar Apresentação
                </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

