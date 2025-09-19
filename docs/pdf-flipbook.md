# PDF FlipBook Component

This document explains how to use the PDF FlipBook component to display PDF files as interactive flipbooks in your Next.js application.

## Overview

The PDF FlipBook component allows you to convert PDF files into an interactive flipbook that users can navigate through by flipping pages. It uses `react-pdf` for PDF rendering and `react-pageflip` for the flipbook functionality.

## Installation

The required dependencies are already installed in the project:

- `react-pageflip`: For the flipbook functionality
- `react-pdf` and `pdfjs-dist`: For PDF rendering

## Usage

### Basic Usage

```jsx
import FlipBook from '../components/stories/FlipBook';

function MyComponent() {
  return (
    <FlipBook 
      fileUrl="/path/to/your/document.pdf" 
      cover="/path/to/cover/image.jpg" 
    />
  );
}
```

### Props

- `fileUrl` (string, required): URL or path to the PDF file
- `cover` (string, required): URL or path to the cover image

## How It Works

1. The component loads the PDF file using `react-pdf`
2. Each page of the PDF is rendered to a canvas and converted to an image
3. The images are displayed in a flipbook using `react-pageflip`
4. Users can navigate through the pages by clicking and dragging

## Example

A complete example is available at `/app/pdf-flipbook-example/page.tsx`. This example includes:

- A form to input a PDF URL
- The FlipBook component to display the PDF
- Instructions for users

## Styling

The component includes default styles in `globals.css` for:

- Loading indicator
- Error messages
- PDF pages
- Flipbook container

You can customize these styles by modifying the CSS classes in `globals.css`.

## Troubleshooting

### CORS Issues

If you're loading PDFs from external domains, you may encounter CORS issues. To resolve this:

1. Ensure the server hosting the PDF allows cross-origin requests
2. Consider proxying the PDF through your own server
3. Host the PDFs on the same domain as your application

### Performance Considerations

- Large PDFs may take longer to load and convert
- Consider implementing pagination or lazy loading for very large documents
- The quality of the rendered images can be adjusted by modifying the `scale` parameter in the `convertPdfToImages` function

## Browser Compatibility

The component should work in all modern browsers that support canvas and the PDF.js library.