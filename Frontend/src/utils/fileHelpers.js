import * as pdfjsLib from 'pdfjs-dist';

// 1. Import the worker explicitly so Vite/Webpack bundles it
import 'pdfjs-dist/build/pdf.worker.min.mjs';

// 2. Point the workerSrc to the local bundled file
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

/**
 * Rotates a Base64 Image Data URL by 90 degrees (clockwise or counter-clockwise)
 */
export const rotateImage = (imageSrc, direction = 'CW') => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Swap width and height because we are rotating 90 degrees
      canvas.width = img.height;
      canvas.height = img.width;

      // Translate context to center of canvas
      ctx.translate(canvas.width / 2, canvas.height / 2);

      // Rotate context
      const degrees = direction === 'CW' ? 90 : -90;
      ctx.rotate((degrees * Math.PI) / 180);

      // Draw image (centered)
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      resolve(canvas.toDataURL('image/jpeg'));
    };
    img.onerror = reject;
  });
};

/**
 * Handles PDF or Image file input.
 * If PDF, renders the first page to an Image Data URL.
 */
export const processFile = async (file) => {
  if (file.type === 'application/pdf') {
    return await convertPdfToImage(file);
  } else {
    return await readFileAsUrl(file);
  }
};

const readFileAsUrl = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
};

const convertPdfToImage = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  
  // Fetch the first page
  const page = await pdf.getPage(1);
  
  const viewport = page.getViewport({ scale: 2.0 }); // Scale 2.0 for better quality
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  await page.render({ canvasContext: context, viewport: viewport }).promise;
  return canvas.toDataURL('image/jpeg');
};