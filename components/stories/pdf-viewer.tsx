"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  src: string;
  title: string;
}

export default function PDFViewer({ src, title }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  function onDocumentLoadError(error: any) {
    console.error("PDF loading error:", error);
    setError("Failed to load PDF. Please try again later.");
    setLoading(false);
  }

  const goToPrevPage = () => {
    setPageNumber((page) => Math.max(1, page - 1));
  };

  const goToNextPage = () => {
    setPageNumber((page) => Math.min(numPages, page + 1));
  };

  const zoomIn = () => {
    setScale((scale) => Math.min(2.0, scale + 0.2));
  };

  const zoomOut = () => {
    setScale((scale) => Math.max(0.5, scale - 0.2));
  };

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="text-ninja-crimson mb-4">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="font-ninja text-xl text-ninja-black mb-2">
          Unable to Load Story
        </h3>
        <p className="text-ninja-gray">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-ninja-gray border-opacity-20 overflow-hidden">
      {/* Controls */}
      <div className="flex items-center justify-between p-4 bg-ninja-light-gray border-b border-ninja-gray border-opacity-20">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-ninja-gray px-2">
            {loading ? "Loading..." : `${pageNumber} of ${numPages}`}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={zoomOut}
            disabled={scale <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-ninja-gray px-2">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={zoomIn}
            disabled={scale >= 2.0}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="p-4 overflow-auto max-h-screen bg-gray-50">
        <div className="flex justify-center">
          {loading && (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ninja-crimson mx-auto mb-4"></div>
              <p className="text-ninja-gray">Loading story...</p>
            </div>
          )}
          <Document
            file={src}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading=""
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        </div>
      </div>
    </div>
  );
}
