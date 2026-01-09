import { useState } from "react";
import { Project } from "../types";
import { Presentation, Plus, Trash2, Edit2, Calendar, Layers } from "lucide-react";
import { motion } from "framer-motion";

interface ProjectsScreenProps {
  projects: Project[];
  onCreateNew: () => void;
  onOpenProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onRenameProject: (projectId: string, newName: string) => void;
  onConfirmDelete?: (projectId: string, projectName: string) => void;
}

export const ProjectsScreen = ({ 
  projects, 
  onCreateNew, 
  onOpenProject, 
  onDeleteProject,
  onRenameProject,
  onConfirmDelete
}: ProjectsScreenProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

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

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      background: 'var(--bg-main)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '60px 40px',
      overflowY: 'auto'
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '1200px',
        width: '100%',
        marginBottom: '40px'
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
          color: 'var(--text-secondary)'
        }}>
          Gerencie suas apresentações e rascunhos
        </p>
      </div>

      {/* Projects Grid */}
      <div style={{
        maxWidth: '1200px',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '24px'
      }}>
        {/* New Project Card */}
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

        {/* Existing Projects */}
        {projects.map((project) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            style={{
              background: 'var(--bg-sidebar)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.3s var(--easing)',
              position: 'relative'
            }}
          >
            {/* Preview */}
            <div 
              onClick={() => onOpenProject(project.id)}
              style={{
                height: '160px',
                background: 'linear-gradient(135deg, var(--accent) 0%, rgba(var(--accent-rgb), 0.6) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Presentation size={48} color="white" opacity={0.3} />
              <div style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                background: 'rgba(0,0,0,0.5)',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Layers size={14} />
                {project.slides.length} slides
              </div>
            </div>

            {/* Info */}
            <div style={{ padding: '20px' }}>
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

              {/* Actions */}
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

      {/* Empty State */}
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
