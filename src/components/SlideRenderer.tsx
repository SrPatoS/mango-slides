import { Slide, SlideTheme, SlideFont } from "../types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface SlideRendererProps {
    slide: Slide;
    scale?: number;
    activeTheme?: SlideTheme;
    activeFont?: SlideFont;
    width?: number;  // Largura base do slide (padrão 1000)
    height?: number; // Altura base do slide (padrão 600)
}

export const SlideRenderer = ({ 
    slide, 
    scale = 1, 
    activeTheme = 'light',
    activeFont = 'sans',
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

    const getFontFamily = (font: SlideFont) => {
        switch(font) {
            case 'sans': return "'Inter', sans-serif";
            case 'serif': return "'Merriweather', serif";
            case 'mono': return "'Fira Code', monospace";
            case 'display': return "'Outfit', sans-serif";
            case 'handwritten': return "'Patrick Hand', cursive";
            case 'times': return "'Times New Roman', serif";
            default: return "'Inter', sans-serif";
        }
    };

    const themeBg = getThemeBackground(activeTheme);
    const themeText = getThemeTextColor(activeTheme);
    const fontFamily = getFontFamily(activeFont);

    // Paleta de cores simples para Pie Chart variantes
    const getPieColors = (baseColor: string) => [
        baseColor,
        '#94a3b8',
        '#cbd5e1', 
        '#64748b',
        '#475569'
    ];

    return (
      <div style={{
        width: `${width * scale}px`,
        height: `${height * scale}px`,
        position: 'relative',
        overflow: 'hidden',
        background: slide.backgroundColor || themeBg,
        borderLeft: activeTheme === 'minimal' && scale < 0.5 ? '4px solid #0f172a' : 'none',
        fontFamily: fontFamily
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
                    backgroundColor: el.backgroundColor || 'transparent',
                    pointerEvents: 'none', // Importante para drag & drop funcionar corretamente no editor (o container pai que lida)
                    zIndex: el.type === 'chart' ? 10 : 1
                }}
                >
                {el.type === 'text' && (
                    <div style={{
                    fontSize: `${(el.fontSize || 24) * scale}px`,
                    fontWeight: el.fontWeight || 'normal',
                    fontStyle: el.fontStyle || 'normal',
                    fontFamily: fontFamily, 
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
                {el.type === 'chart' && el.chartData && (
                   <div style={{ width: '100%', height: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                         {el.chartType === 'bar' ? (
                             <BarChart data={el.chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.3} stroke={themeText} />
                                <XAxis dataKey="name" stroke={themeText} fontSize={10 * scale} tickLine={false} axisLine={{ stroke: themeText, opacity: 0.5 }} />
                                <YAxis stroke={themeText} fontSize={10 * scale} tickLine={false} axisLine={{ stroke: themeText, opacity: 0.5 }} />
                                <Tooltip cursor={{fill: 'rgba(255,255,255,0.1)'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: '#000' }} />
                                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                <Bar dataKey="value" name="Valor" fill={el.color || '#8b5cf6'} radius={[4, 4, 0, 0]} animationDuration={1000} />
                             </BarChart>
                         ) : el.chartType === 'line' ? (
                             <LineChart data={el.chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.3} stroke={themeText} />
                                <XAxis dataKey="name" stroke={themeText} fontSize={10 * scale} axisLine={{ stroke: themeText, opacity: 0.5 }} />
                                <YAxis stroke={themeText} fontSize={10 * scale} axisLine={{ stroke: themeText, opacity: 0.5 }} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: '#000' }} />
                                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                <Line type="monotone" dataKey="value" name="Valor" stroke={el.color || '#8b5cf6'} strokeWidth={3 * scale} dot={{r: 4 * scale, fill: el.color || '#8b5cf6'}} animationDuration={1000} />
                             </LineChart>
                         ) : (
                             <PieChart>
                                 <Pie 
                                   data={el.chartData} 
                                   dataKey="value" 
                                   nameKey="name" 
                                   cx="50%" 
                                   cy="50%" 
                                   outerRadius="80%" 
                                   fill={el.color || "#8884d8"}
                                   label={({name, percent}) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                   labelLine={{ stroke: themeText }}
                                   animationDuration={1000}
                                   stroke="none"
                                 >
                                    {el.chartData.map((_entry, index) => (
                                      <Cell key={`cell-${index}`} fill={getPieColors(el.color || '#8884d8')[index % 5]} />
                                    ))}
                                 </Pie>
                                 <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: '#000' }} />
                                 <Legend />
                             </PieChart>
                         )}
                      </ResponsiveContainer>
                   </div>
                )}
                </div>
            );
          })}
      </div>
    );
};
