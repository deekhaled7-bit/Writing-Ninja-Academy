import { pdfjs } from 'react-pdf';

// Ensure the worker is set up
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

/**
 * Converts a PDF file to an array of image URLs
 * @param pdfUrl URL of the PDF file
 * @param scale Scale factor for rendering (default: 2.0 for better quality)
 * @returns Promise resolving to an array of image data URLs
 */
export async function convertPdfToImages(pdfUrl: string, scale: number = 2.0): Promise<string[]> {
  try {
    // Load the PDF document
    const loadingTask = pdfjs.getDocument(pdfUrl);
    const pdf = await loadingTask.promise;
    
    const numPages = pdf.numPages;
    const imageUrls: string[] = [];
    
    // Process each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      
      // Calculate viewport dimensions
      const viewport = page.getViewport({ scale });
      
      // Create a canvas for rendering
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Could not create canvas context');
      }
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // Render the page to canvas
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      
      // Convert canvas to image data URL
      const imageUrl = canvas.toDataURL('image/jpeg', 0.8);
      imageUrls.push(imageUrl);
    }
    
    return imageUrls;
  } catch (error) {
    console.error('Error converting PDF to images:', error);
    throw error;
  }
}