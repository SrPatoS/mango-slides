import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { createRoot } from "react-dom/client";
import { Slide, SlideTheme } from "../types";
import { SlideRenderer } from "../components/SlideRenderer";
// Import React to support JSX validation
import React from 'react';

export const exportToPdf = async (slides: Slide[], activeTheme: SlideTheme, filename: string = "apresentacao.pdf") => {
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [1000, 600]
  });

  // Criar container invisível
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "0";
  container.style.left = "0";
  // Usar z-index negativo para ficar atrás de tudo mas ainda renderizável visualmente (alguns browsers otimizam coisa totalmente fora da tela)
  container.style.zIndex = "-9999"; 
  container.style.width = "1000px";
  container.style.height = "600px"; 
  document.body.appendChild(container);

  const root = createRoot(container);

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    
    // Renderiza o slide no container
    await new Promise<void>((resolve) => {
        root.render(
            <SlideRenderer 
                slide={slide} 
                activeTheme={activeTheme} 
                scale={1} 
                width={1000} 
                height={600}
            />
        );
        // Delay para garantir renderização e carregamento de imagens
        setTimeout(resolve, 300); 
    });

    try {
        const canvas = await html2canvas(container, {
            scale: 2, // 2x para melhor qualidade no PDF
            useCORS: true,
            logging: false,
            backgroundColor: null
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.9);

        if (i > 0) pdf.addPage([1000, 600], "landscape");
        pdf.addImage(imgData, "JPEG", 0, 0, 1000, 600);
    } catch (err) {
        console.error(`Erro ao renderizar slide ${i + 1}:`, err);
    }
  }

  // Em vez de pdf.save(), vamos usar o diálogo nativo do Tauri
  try {
      const { save } = await import('@tauri-apps/plugin-dialog');
      const { writeFile } = await import('@tauri-apps/plugin-fs');

      const selectedPath = await save({
          defaultPath: filename,
          filters: [{
              name: 'PDF Document',
              extensions: ['pdf']
          }]
      });

      if (selectedPath) {
          const pdfOutput = pdf.output('arraybuffer');
          await writeFile(selectedPath, new Uint8Array(pdfOutput));
          
          // Sucesso
          const { message } = await import('@tauri-apps/plugin-dialog');
          await message('PDF exportado com sucesso!', {
              title: 'Sucesso',
              kind: 'info'
          });
       }
  } catch (err) {
      console.error("Erro ao salvar PDF:", err);
      // Fallback para download padrão se falhar a API nativa
      pdf.save(filename);
  }
  
  // Limpeza
  setTimeout(() => {
      root.unmount();
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
  }, 100);
};
