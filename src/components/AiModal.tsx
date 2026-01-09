import { X, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

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
  onGenerate: () => void;
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
  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <motion.div 
        className="settings-modal" 
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        style={{ maxWidth: '500px' }}
      >
        <div className="settings-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles size={20} className="sparkle-icon" />
            <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>Gerar conteúdo com IA</h2>
          </div>
          {!isGenerating && (
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          )}
        </div>

        <div className="settings-content">
          {isGenerating ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p style={{ color: 'var(--text-secondary)' }}>A IA está criando {numSlides} slides para você...</p>
            </div>
          ) : (
            <div className="prompt-container">
              <div className="ai-controls-row">
                <div className="ai-select-container" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Modelo
                  </label>
                  <select 
                    className="ai-select"
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                  >
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                  </select>
                </div>

                <div className="density-container">
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Densidade
                  </label>
                  <select 
                    className="ai-select"
                    value={contentDensity}
                    onChange={(e) => setContentDensity(e.target.value)}
                  >
                    <option value="bullets">Apenas Tópicos</option>
                    <option value="low">Pouco Texto</option>
                    <option value="medium">Médio</option>
                    <option value="high">Muito Texto</option>
                  </select>
                </div>

                <div className="page-count-container">
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Conteúdo
                  </label>
                  <input 
                    type="number" 
                    className="page-input"
                    min="1"
                    max="10"
                    value={numSlides}
                    onChange={(e) => setNumSlides(parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>

              <div className="ai-options-grid">
                <div className="option-toggle-group">
                  <div className="option-label-desc">
                    <span>Incluir Questionário</span>
                    <span>Questões ao final</span>
                  </div>
                  <input 
                    type="checkbox" 
                    className="toggle-checkbox"
                    style={{ width: '40px', height: '20px' }}
                    checked={includeQuiz}
                    onChange={(e) => setIncludeQuiz(e.target.checked)}
                  />
                </div>

                {includeQuiz && (
                  <div className="quiz-count-input">
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Questões:
                    </label>
                    <input 
                      type="number" 
                      className="page-input"
                      min="1"
                      max="5"
                      style={{ width: '60px' }}
                      value={numQuizQuestions}
                      onChange={(e) => setNumQuizQuestions(parseInt(e.target.value) || 1)}
                    />
                  </div>
                )}
              </div>
              
              <textarea 
                className="prompt-textarea"
                placeholder="Sobre o que deve ser esta apresentação?"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                autoFocus
              />
              
              <div className="prompt-hint">
                Gerará uma capa, {numSlides} slides de conteúdo, 
                {includeQuiz ? ` ${numQuizQuestions} questão(ões)` : ""} e encerramento.
              </div>
            </div>
          )}
        </div>

        <div className="settings-footer">
          <button className="cancel-btn" onClick={onClose} disabled={isGenerating}>Cancelar</button>
          <button 
            className="save-btn" 
            onClick={onGenerate}
            disabled={isGenerating || !aiPrompt.trim()}
          >
            {isGenerating ? "Gerando..." : "Gerar Apresentação"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
