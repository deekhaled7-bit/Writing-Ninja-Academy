import React, { useState, useEffect } from "react";
import HTMLFlipBook from "react-pageflip";
import { convertPdfToImages } from "../../utils/pdfToImages";

const FlipBook = ({ fileUrl, cover }: { fileUrl: string; cover: string }) => {
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPdfImages = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if fileUrl is a PDF
        if (fileUrl && fileUrl.toLowerCase().endsWith(".pdf")) {
          const images = await convertPdfToImages(fileUrl);
          setPageImages(images);
        }
      } catch (err) {
        console.error("Error loading PDF:", err);
        setError("Failed to load PDF. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadPdfImages();
  }, [fileUrl]);

  if (loading) {
    return <div className="loading-indicator">Loading PDF pages...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <HTMLFlipBook
      width={300}
      height={500}
      className="flipBook bg-books-pattern"
      size="fixed"
      minWidth={0}
      maxWidth={0}
      minHeight={0}
      maxHeight={0}
      drawShadow={true}
      flippingTime={1000}
      usePortrait={true}
      startZIndex={0}
      autoSize={true}
      maxShadowOpacity={0.5}
      showCover={true}
      mobileScrollSupport={true}
      style={{}}
      startPage={0}
      swipeDistance={30}
      clickEventForward={true}
      useMouseEvents={true}
      renderOnlyPageLengthChange={false}
      showPageCorners={true}
      disableFlipByClick={false}
    >
      {/* Cover page */}
      <div className="page-content pdf-page">
        <img
          src={cover}
          alt="Cover"
          style={{ height: "100%" }}
          width={300}
          //   height={500}
          //   style={{ width: "100%", height: "100%" }}
        />
      </div>

      {/* PDF pages */}
      {pageImages.length > 0 ? (
        pageImages.map((imageUrl, index) => (
          <div key={`page-${index}`} className="pdf-page">
            <img
              src={imageUrl}
              alt={`Page ${index + 1}`}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        ))
      ) : (
        // Fallback to demo pages if no PDF or PDF has no pages
        <>
          <div className="demoPage">Page 1</div>
          <div className="demoPage">Page 2</div>
          <div className="demoPage">Page 3</div>
          <div className="demoPage">Page 4</div>
        </>
      )}
    </HTMLFlipBook>
  );
};

export default FlipBook;
