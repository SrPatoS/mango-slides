import { Slide, SlideTheme } from "../types";

interface SlideRendererProps {
    slide: Slide;
    scale?: number;
    activeTheme?: SlideTheme;
    width?: number;  // Largura base do slide (padrão 1000)
    height?: number; // Altura base do slide (padrão 600)
}

export const SlideRenderer = ({ 
    slide, 
    scale = 1, 
    activeTheme = 'light',
    width = 1000,
    height = 600
}: SlideRendererProps) => {

    const getThemeBackground = (theme: SlideTheme) => {
        switch (theme) {
            case 'light': return '#f8fafc';
            case 'dark': return '#0f172a';
            case 'corporate': return 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
            case 'purple': return 'linear-gradient(135deg, #4c1d95 0%, #1e1b4b 100%)';
            case 'minimal': return '#ffffff';
            default: return '#ffffff';
        }
    };

    const getThemeTextColor = (theme: SlideTheme) => {
        switch (theme) {
            case 'light': return '#0f172a';
            case 'dark': return '#f8fafc';
            case 'corporate': return '#ffffff';
            case 'purple': return '#ffffff';
            case 'minimal': return '#18181b';
            default: return '#000000';
        }
    };

    const themeBg = getThemeBackground(activeTheme);
    const themeText = getThemeTextColor(activeTheme);

    return (
      <div style={{
        width: `${width * scale}px`,
        height: `${height * scale}px`,
        position: 'relative',
        overflow: 'hidden',
        background: slide.backgroundColor || themeBg,
        borderLeft: activeTheme === 'minimal' && scale < 0.5 ? '4px solid #0f172a' : 'none' // Borda visual só em thumbnails
      }}>
          {slide.elements.map(el => {
             let elColor = el.color;
             if (!elColor || elColor === 'var(--theme-text)') {
                 elColor = themeText;
             }

             return (
                <div
                key={el.id}
                style={{
                    position: 'absolute',
                    left: `${el.x * scale}px`,
                    top: `${el.y * scale}px`,
                    width: el.width ? `${el.width * scale}px` : 'auto',
                    height: el.height ? `${el.height * scale}px` : 'auto',
                    pointerEvents: 'none'
                }}
                >
                {el.type === 'text' && (
                    <div style={{
                    fontSize: `${(el.fontSize || 24) * scale}px`,
                    fontWeight: el.fontWeight || 'normal',
                    fontStyle: el.fontStyle || 'normal',
                    color: elColor,
                    textAlign: (el as any).textAlign || 'left',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    lineHeight: 1.2
                    }}>
                    {el.content}
                    </div>
                )}
                {el.type === 'rect' && (
                    <div style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: el.color || '#8b5cf6',
                    borderRadius: '8px'
                    }} />
                )}
                {el.type === 'circle' && (
                    <div style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: el.color || '#8b5cf6',
                    borderRadius: '50%'
                    }} />
                )}
                {el.type === 'image' && el.content && (
                    <img 
                    src={el.content} 
                    alt="" 
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                    }}
                    />
                )}
                </div>
            );
          })}
      </div>
    );
};
