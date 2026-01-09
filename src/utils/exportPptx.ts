import PptxGenJS from "pptxgenjs";
import { Slide, SlideTheme } from "../types";

// Helper para gerar imagem de gradiente via Canvas
const createGradientBackground = (theme: SlideTheme): string | null => {
  if (theme !== 'corporate' && theme !== 'purple') return null;

  const width = 1000;
  const height = 562; // 16:9 aspect ratio

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // 1. Base Gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  if (theme === 'corporate') {
    // #1e293b -> #0f172a
    gradient.addColorStop(0, '#1e293b');
    gradient.addColorStop(1, '#0f172a');
  } else if (theme === 'purple') {
    // #4c1d95 -> #1e1b4b
    gradient.addColorStop(0, '#4c1d95');
    gradient.addColorStop(1, '#1e1b4b');
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // 2. Texture Overlay (As "bolinhas")
  if (theme === 'corporate') {
    // Dot Grid Pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    const dotSize = 1;
    const gap = 24;

    for (let x = 0; x < width; x += gap) {
      for (let y = 0; y < height; y += gap) {
        ctx.beginPath();
        ctx.arc(x + 2, y + 2, dotSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (theme === 'purple') {
    // Radial Glow
    const radialGradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, height * 0.7);
    radialGradient.addColorStop(0, 'rgba(139, 92, 246, 0.25)');
    radialGradient.addColorStop(1, 'transparent');

    ctx.fillStyle = radialGradient;
    ctx.fillRect(0, 0, width, height);
  }

  return canvas.toDataURL('image/jpeg', 0.9);
};

export const exportToPptx = async (slides: Slide[], activeTheme: SlideTheme, filename: string = "apresentacao.pptx") => {
  const pres = new PptxGenJS();

  // Configuração básica
  pres.layout = "LAYOUT_16x9";
  pres.title = filename.replace(".pptx", "");

  // Cores de texto fallback
  const getThemeTextColor = (theme: SlideTheme) => {
    switch (theme) {
      case 'light': return '0F172A';
      case 'dark': return 'F8FAFC';
      case 'corporate': return 'FFFFFF';
      case 'purple': return 'FFFFFF';
      case 'minimal': return '18181B';
      default: return '000000';
    }
  };

  const themeTextColor = getThemeTextColor(activeTheme);

  // Gerar background do tema (se for gradiente)
  const themeGradientData = createGradientBackground(activeTheme);

  // Cores sólidas para temas simples
  const getThemeSolidColor = (theme: SlideTheme) => {
    switch (theme) {
      case 'light': return 'F8FAFC';
      case 'dark': return '0F172A';
      case 'minimal': return 'FFFFFF';
      default: return 'FFFFFF';
    }
  }
  const themeSolidColor = getThemeSolidColor(activeTheme);

  // Helper para converter pixels para polegadas (PPTX usa polegadas por padrão ou porcentagem)
  // O canvas original é 1000px de largura. O slide PPTX 16:9 padrão é 10x5.625 polegadas.
  // Fator: 1000px -> 10 inches => 1px = 0.01 inch
  const pxToInch = (px: number) => px * 0.01;

  for (const slideData of slides) {
    const slide = pres.addSlide();

    // Lógica de Background:
    // 1. Se tem cor customizada no slide, usa ela.
    // 2. Se não, e o tema tem gradiente gerado, usa a imagem do gradiente.
    // 3. Se não, usa a cor sólida do tema.

    if (slideData.backgroundColor && slideData.backgroundColor !== 'transparent') {
      const color = slideData.backgroundColor.startsWith('#') ? slideData.backgroundColor.replace('#', '') : themeSolidColor;
      slide.background = { color };
    } else if (themeGradientData) {
      slide.background = { data: themeGradientData };
    } else {
      slide.background = { color: themeSolidColor };
    }

    // Elementos
    // Processamento de Elementos (com Collision Detection)
    // 1. Clonar e ordenar elementos
    const elementsToRender = JSON.parse(JSON.stringify(slideData.elements)); // Deep copy para não mutar original

    // Ordenar elementos por Y para processar de cima para baixo
    elementsToRender.sort((a: any, b: any) => a.y - b.y);

    for (let i = 0; i < elementsToRender.length; i++) {
      const el = elementsToRender[i];

      // Se for texto grande (Título), calcular altura real
      if (el.type === 'text' && (el.fontSize || 24) >= 32) {
        const fontSize = el.fontSize || 48;
        // Estimativa Ajustada: 0.7 * fontSize para prever letras largas/bold
        const boxWidth = el.width || 880;
        const charWidth = fontSize * 0.7;
        const charsPerLine = Math.floor(boxWidth / charWidth);
        const lines = Math.ceil((el.content || "").length / charsPerLine);
        const lineHeight = fontSize * 1.35;
        const estimatedHeight = lines * lineHeight;

        const bottomY = el.y + estimatedHeight;

        // Verificar se o próximo elemento colide
        for (let j = i + 1; j < elementsToRender.length; j++) {
          const nextEl = elementsToRender[j];
          // Se o próximo elemento começa antes do fim deste título + margem safe (60px)
          if (nextEl.y < bottomY + 60) {
            // Empurrar o próximo elemento
            const shift = (bottomY + 60) - nextEl.y;
            nextEl.y += shift;
          }
        }
      }
    }

    // Renderizar Elementos Ajustados
    elementsToRender.forEach((el: any) => {
      const x = pxToInch(el.x);
      const y = pxToInch(el.y);
      const w = el.width ? pxToInch(el.width) : undefined;
      const h = el.height ? pxToInch(el.height) : undefined;

      // Cores
      let color = themeTextColor;
      if (el.color && el.color !== 'var(--theme-text)') {
        if (el.color.startsWith('#')) color = el.color.replace('#', '');
      }

      const fontSize = el.fontSize || 24;

      if (el.type === 'text') {
        slide.addText(el.content, {
          x, y, w, h,
          fontSize,
          color,
          fontFace: 'Arial', // Fallback font
          // Alignment
          align: (el as any).textAlign || 'left',
          valign: 'top',
          // Text wrapping
          wrap: true
        });
      }
      else if (el.type === 'image') {
        if (el.content) {
          // pptxgenjs aceita base64 data URIs
          slide.addImage({
            data: el.content,
            x, y, w, h
          });
        }
      }
      else if (el.type === 'rect') {
        slide.addShape(pres.ShapeType.rect, {
          x, y, w, h,
          fill: { color },
          line: { color: 'transparent' }
        });
      }
      else if (el.type === 'circle') {
        slide.addShape(pres.ShapeType.ellipse, {
          x, y, w, h,
          fill: { color },
          line: { color: 'transparent' }
        });
      }
    });
  }

  // Salvar com diálogo nativo
  try {
    const { save } = await import('@tauri-apps/plugin-dialog');
    const { writeFile } = await import('@tauri-apps/plugin-fs');

    const selectedPath = await save({
      defaultPath: filename,
      filters: [{
        name: 'PowerPoint Presentation',
        extensions: ['pptx']
      }]
    });

    if (selectedPath) {
      // Gerar blob/buffer
      const buffer = await pres.write({ outputType: 'arraybuffer' }) as ArrayBuffer;
      await writeFile(selectedPath, new Uint8Array(buffer));

      // Sucesso
      const { message } = await import('@tauri-apps/plugin-dialog');
      await message('Apresentação exportada com sucesso!', {
        title: 'Sucesso',
        kind: 'info'
      });
    }
  } catch (err) {
    console.error("Erro ao salvar PPTX:", err);
    // Fallback
    await pres.writeFile({ fileName: filename });
  }
};
