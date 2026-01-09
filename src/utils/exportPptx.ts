import PptxGenJS from "pptxgenjs";
import { Slide } from "../types";

export const exportToPptx = async (slides: Slide[], filename: string = "apresentacao.pptx") => {
  const pres = new PptxGenJS();

  // Configuração básica
  pres.layout = "LAYOUT_16x9";
  pres.title = filename.replace(".pptx", "");

  // Helper para converter pixels para polegadas (PPTX usa polegadas por padrão ou porcentagem)
  // O canvas original é 1000px de largura. O slide PPTX 16:9 padrão é 10x5.625 polegadas.
  // Fator: 1000px -> 10 inches => 1px = 0.01 inch
  const pxToInch = (px: number) => px * 0.01;

  for (const slideData of slides) {
    const slide = pres.addSlide();

    // Background
    if (slideData.backgroundColor) {
      // Se for cor hex
      const color = slideData.backgroundColor.replace('#', '');
      slide.background = { color };
    } else {
      // Fallback para branco se não tiver cor definida
      slide.background = { color: 'FFFFFF' };
      // TODO: Passar o activeTheme para pegar a cor correta seria ideal, 
      // mas aqui estamos pegando direto do slideData. 
      // Se o slideData não tiver bg, vai ficar branco.
    }

    // Elementos
    // Ordenar por z-index (índice no array)
    slideData.elements.forEach((el) => {
      const x = pxToInch(el.x);
      const y = pxToInch(el.y);
      const w = el.width ? pxToInch(el.width) : undefined;
      const h = el.height ? pxToInch(el.height) : undefined;

      // Cores
      let color = '000000';
      if (el.color) {
        if (el.color.startsWith('#')) color = el.color.replace('#', '');
        else if (el.color === 'var(--theme-text)') color = '333333'; // Fallback seguro
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
