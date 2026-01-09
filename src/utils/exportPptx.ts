import PptxGenJS from "pptxgenjs";
import { Slide, SlideTheme } from "../types";

const createGradientBackground = (theme: SlideTheme): string | null => {
  if (theme !== 'corporate' && theme !== 'purple') return null;

  const width = 1000;
  const height = 562; 

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  if (theme === 'corporate') {

    gradient.addColorStop(0, '#1e293b');
    gradient.addColorStop(1, '#0f172a');
  } else if (theme === 'purple') {

    gradient.addColorStop(0, '#4c1d95');
    gradient.addColorStop(1, '#1e1b4b');
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  if (theme === 'corporate') {

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

  pres.layout = "LAYOUT_16x9";
  pres.title = filename.replace(".pptx", "");

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

  const themeGradientData = createGradientBackground(activeTheme);

  const getThemeSolidColor = (theme: SlideTheme) => {
    switch (theme) {
      case 'light': return 'F8FAFC';
      case 'dark': return '0F172A';
      case 'minimal': return 'FFFFFF';
      default: return 'FFFFFF';
    }
  }
  const themeSolidColor = getThemeSolidColor(activeTheme);

  const pxToInch = (px: number) => px * 0.01;

  for (const slideData of slides) {
    const slide = pres.addSlide();

    if (slideData.backgroundColor && slideData.backgroundColor !== 'transparent') {
      const color = slideData.backgroundColor.startsWith('#') ? slideData.backgroundColor.replace('#', '') : themeSolidColor;
      slide.background = { color };
    } else if (themeGradientData) {
      slide.background = { data: themeGradientData };
    } else {
      slide.background = { color: themeSolidColor };
    }

    const elementsToRender = JSON.parse(JSON.stringify(slideData.elements)); 

    elementsToRender.sort((a: any, b: any) => a.y - b.y);

    for (let i = 0; i < elementsToRender.length; i++) {
      const el = elementsToRender[i];

      if (el.type === 'text' && (el.fontSize || 24) >= 32) {
        const fontSize = el.fontSize || 48;

        const boxWidth = el.width || 880;
        const charWidth = fontSize * 0.7;
        const charsPerLine = Math.floor(boxWidth / charWidth);
        const lines = Math.ceil((el.content || "").length / charsPerLine);
        const lineHeight = fontSize * 1.35;
        const estimatedHeight = lines * lineHeight;

        const bottomY = el.y + estimatedHeight;

        for (let j = i + 1; j < elementsToRender.length; j++) {
          const nextEl = elementsToRender[j];

          if (nextEl.y < bottomY + 60) {

            const shift = (bottomY + 60) - nextEl.y;
            nextEl.y += shift;
          }
        }
      }
    }

    elementsToRender.forEach((el: any) => {
      const x = pxToInch(el.x);
      const y = pxToInch(el.y);
      const w = el.width ? pxToInch(el.width) : undefined;
      const h = el.height ? pxToInch(el.height) : undefined;

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
          fontFace: 'Arial', 

          align: (el as any).textAlign || 'left',
          valign: 'top',

          wrap: true
        });
      }
      else if (el.type === 'image') {
        if (el.content) {

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

      const buffer = await pres.write({ outputType: 'arraybuffer' }) as ArrayBuffer;
      await writeFile(selectedPath, new Uint8Array(buffer));

      const { message } = await import('@tauri-apps/plugin-dialog');
      await message('Apresentação exportada com sucesso!', {
        title: 'Sucesso',
        kind: 'info'
      });
    }
  } catch (err) {
    console.error("Erro ao salvar PPTX:", err);

    await pres.writeFile({ fileName: filename });
  }
};


