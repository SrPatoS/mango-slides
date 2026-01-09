import { 
  MousePointer2, 
  Type, 
  ImageIcon, 
  Square, 
  Circle, 
  Layers, 
  Sparkles, 
  Settings 
} from "lucide-react";

interface ToolbarProps {
  activeTool: string;
  setActiveTool: (tool: string) => void;
  geminiEnabled: boolean;
  onOpenAiModal: () => void;
  onOpenSettings: () => void;
}

export const Toolbar = ({ 
  activeTool, 
  setActiveTool, 
  onOpenAiModal, 
  onOpenSettings 
}: Omit<ToolbarProps, 'geminiEnabled'>) => {
  const tools = [
    { id: 'select', icon: MousePointer2 },
    { id: 'text', icon: Type },
    { id: 'image', icon: ImageIcon },
    { id: 'rect', icon: Square },
    { id: 'circle', icon: Circle },
    { id: 'layers', icon: Layers },
    { 
      id: 'ai', 
      icon: Sparkles, 
      className: 'ai-sparkle',
      onClick: onOpenAiModal
    },
    { id: 'settings', icon: Settings, onClick: onOpenSettings },
  ];

  return (
    <div className="toolbar">
      {tools.map((tool: any) => (
        <div key={tool.id} className={tool.id === 'ai' ? 'ai-generation-control' : ''}>
          <button 
            className={`tool-btn ${activeTool === tool.id ? 'active' : ''} ${tool.className || ''}`}
            onClick={tool.onClick ? tool.onClick : () => setActiveTool(tool.id)}
          >
            <tool.icon size={20} />
          </button>
        </div>
      ))}
    </div>
  );
};
