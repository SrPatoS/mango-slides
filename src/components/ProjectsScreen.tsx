import { useState } from "react";
import { Project } from "../types";
import { Presentation, Plus, Trash2, Edit2, Calendar, Layers, Settings, Search } from "lucide-react";
import { motion } from "framer-motion";
import { SlideRenderer } from "./SlideRenderer";

interface ProjectsScreenProps {
  projects: Project[];
  onCreateNew: () => void;
  onOpenProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onRenameProject: (projectId: string, newName: string) => void;
  onConfirmDelete?: (projectId: string, projectName: string) => void;
  onOpenSettings?: () => void;
}

export const ProjectsScreen = ({ 
  projects, 
  onCreateNew, 
  onOpenProject, 
  onDeleteProject,
  onRenameProject,
  onConfirmDelete,
  onOpenSettings
}: ProjectsScreenProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const handleStartEdit = (project: Project) => {
    setEditingId(project.id);
    setEditName(project.name);
  };

  const handleSaveEdit = (projectId: string) => {
    if (editName.trim()) {
      onRenameProject(projectId, editName.trim());
    }
    setEditingId(null);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      background: 'var(--bg-main)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '60px 40px',
      overflowY: 'auto',
      position: 'relative'
    }}>
      {onOpenSettings && (
        <button
          onClick={onOpenSettings}
          style={{
            position: 'absolute',
            top: '40px',
            right: '40px',
            background: 'var(--bg-sidebar)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '12px',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            zIndex: 10
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'var(--accent)';
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.color = 'white';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'var(--bg-sidebar)';
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          title="Configurações"
        >
          <Settings size={24} />
        </button>
      )}

      <div style={{
        textAlign: 'center',
        marginBottom: '32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '600px'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '8px',
          fontFamily: 'Outfit, sans-serif'
        }}>
          Meus Projetos
        </h1>
        <p style={{
          fontSize: '1rem',
          color: 'var(--text-secondary)',
          marginBottom: '32px'
        }}>
          Gerencie suas apresentações e rascunhos
        </p>

        <div style={{ 
            position: 'relative', 
            width: '100%', 
            maxWidth: '480px' 
        }}>
            <Search 
                size={20} 
                style={{ 
                    position: 'absolute', 
                    left: '16px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: 'var(--text-secondary)' 
                }} 
            />
            <input 
                type="text" 
                placeholder="Buscar projetos..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                    width: '100%',
                    padding: '14px 16px 14px 48px',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-sidebar)',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
        </div>
      </div>

      <div style={{
        maxWidth: '1200px',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '24px'
      }}>
        {!searchTerm && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCreateNew}
            style={{
              background: 'var(--bg-sidebar)',
              border: '2px dashed var(--border)',
              borderRadius: '16px',
              padding: '40px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              minHeight: '280px',
              transition: 'all 0.3s var(--easing)'
            }}
          >
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <Plus size={32} />
            </div>
            <span style={{
              fontSize: '1.1rem',
              fontWeight: 600,
              color: 'var(--text-primary)'
            }}>
              Novo Projeto
            </span>
            <span style={{
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
              textAlign: 'center'
            }}>
              Crie uma nova apresentação do zero
            </span>
          </motion.div>
        )}

        {filteredProjects.map((project) => (
          <motion.div
            key={project.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ scale: 1.02 }}
            style={{
              background: 'var(--bg-sidebar)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.3s var(--easing)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div 
              onClick={() => onOpenProject(project.id)}
              style={{
                height: '180px',
                background: 'var(--bg-main)',
                position: 'relative',
                overflow: 'hidden',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {project.slides && project.slides.length > 0 ? (
                  <div style={{
                      transform: 'scale(0.32)',
                      transformOrigin: 'center',
                      width: '1000px',
                      height: '600px',
                      pointerEvents: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                  }}>
                    <SlideRenderer 
                        slide={project.slides[0]} 
                        activeTheme={project.activeTheme} 
                        scale={1}
                        width={1000}
                        height={600}
                    />
                  </div>
              ) : (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.5
                  }}>
                      <Presentation size={48} color="var(--text-secondary)" />
                      <span style={{ marginTop: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Sem slides</span>
                  </div>
              )}
              
              <div style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                background: 'rgba(0,0,0,0.6)',
                color: 'white',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                zIndex: 5
              }}>
                <Layers size={12} />
                {project.slides?.length || 0} slides
              </div>
            </div>

            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              {editingId === project.id ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => handleSaveEdit(project.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit(project.id);
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  autoFocus
                  style={{
                    width: '100%',
                    background: 'var(--bg-main)',
                    border: '1px solid var(--accent)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '12px'
                  }}
                />
              ) : (
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '12px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {project.name}
                </h3>
              )}

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--text-secondary)',
                fontSize: '0.85rem',
                marginBottom: '16px'
              }}>
                <Calendar size={14} />
                {formatDate(project.updatedAt)}
              </div>

              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartEdit(project);
                  }}
                  style={{
                    flex: 1,
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '8px',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontSize: '0.85rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <Edit2 size={14} />
                  Renomear
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onConfirmDelete) {
                      onConfirmDelete(project.id, project.name);
                    } else if (confirm(`Deseja realmente excluir "${project.name}"?`)) {
                      onDeleteProject(project.id);
                    }
                  }}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    padding: '8px',
                    color: '#ef4444',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {projects.length === 0 && (
        <div style={{
          marginTop: '60px',
          textAlign: 'center',
          color: 'var(--text-secondary)'
        }}>
          <Presentation size={64} style={{ opacity: 0.3, marginBottom: '16px' }} />
          <p style={{ fontSize: '1.1rem' }}>
            Nenhum projeto ainda. Crie seu primeiro!
          </p>
        </div>
      )}
    </div>
  );
};
