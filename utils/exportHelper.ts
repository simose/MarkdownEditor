import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

// Helper: Convert Blob to Base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const downloadHtml = async (content: string, filename: string) => {
  const previewElement = document.getElementById('markdown-preview');
  let htmlContent = '';

  if (previewElement) {
    // Clone the preview node so we can modify it (replace blobs) without touching the UI
    const clone = previewElement.cloneNode(true) as HTMLElement;
    
    // Find all images with blob: URLs and convert them to Base64
    // This ensures the exported HTML file has embedded images and doesn't rely on browser session URLs
    const images = clone.getElementsByTagName('img');
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (img.src.startsWith('blob:')) {
        try {
          const response = await fetch(img.src);
          const blob = await response.blob();
          const base64 = await blobToBase64(blob);
          img.src = base64;
        } catch (e) {
          console.warn('Failed to embed image for export:', e);
        }
      }
    }
    htmlContent = clone.innerHTML;
  } else {
    // Fallback if preview isn't mounted (unlikely)
    htmlContent = `<pre>${content}</pre>`;
  }

  // Wrap content in a basic HTML structure for valid standalone files
  const fullHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${filename}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem; color: #333; }
          pre { background: #f4f4f4; padding: 1rem; border-radius: 4px; overflow-x: auto; }
          code { font-family: monospace; background: #eee; padding: 0.2rem 0.4rem; border-radius: 3px; }
          blockquote { border-left: 4px solid #ddd; padding-left: 1rem; color: #666; }
          table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          img { max-width: 100%; height: auto; }
          a { color: #2563eb; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `;
  
  const blob = new Blob([fullHtml], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const downloadImage = async (element: HTMLElement, filename: string) => {
  try {
    // Capture the full scroll height
    // We pass explicit dimensions and style overrides to ensure the library captures the full content
    // regardless of the current scroll window.
    const dataUrl = await toPng(element, { 
      backgroundColor: '#ffffff', 
      cacheBust: true,
      width: element.scrollWidth,
      height: element.scrollHeight,
      style: {
        overflow: 'visible',
        height: 'auto',
        maxHeight: 'none',
        transform: 'none', 
      }
    });
    
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error('Failed to export image', err);
    alert('Failed to generate image. Please try again.');
  }
};

export const downloadPdf = async (element: HTMLElement, filename: string) => {
  try {
    // 1. Capture full content as a high-quality image
    const dataUrl = await toPng(element, { 
      backgroundColor: '#ffffff', 
      quality: 0.95, // Higher quality for PDF
      width: element.scrollWidth,
      height: element.scrollHeight,
       style: {
        overflow: 'visible',
        height: 'auto',
        maxHeight: 'none',
        transform: 'none'
      }
    });
    
    // 2. Calculate dimensions to fit the image into a PDF
    const img = new Image();
    img.src = dataUrl;
    await new Promise((resolve) => { img.onload = resolve; });

    const imgWidth = img.width;
    const imgHeight = img.height;

    // Standard A4 width in mm (approx)
    const a4WidthMm = 210; 
    const a4HeightMm = 297;
    
    // Calculate how tall the content would be if scaled to A4 width
    const contentWidthMm = a4WidthMm;
    const contentHeightMm = (imgHeight * a4WidthMm) / imgWidth;

    // 3. Determine PDF Page Size
    // If the content is longer than A4, we create a custom page size (Single Long Page).
    // This ensures all content is visible without awkward page breaks cutting text.
    // If users want standard pagination, they should use the browser's print function.
    let pageFormat: string | number[] = 'a4';
    
    if (contentHeightMm > a4HeightMm) {
      pageFormat = [contentWidthMm, contentHeightMm];
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: pageFormat,
    });

    // 4. Add image to PDF
    pdf.addImage(dataUrl, 'PNG', 0, 0, contentWidthMm, contentHeightMm);
    pdf.save(`${filename}.pdf`);

  } catch (err) {
    console.error("PDF generation failed", err);
    // Fallback
    const confirmPrint = window.confirm("PDF generation encountered an error. Would you like to try using the browser's print dialog?");
    if (confirmPrint) {
        window.print();
    }
  }
};