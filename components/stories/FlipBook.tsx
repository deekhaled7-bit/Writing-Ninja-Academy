"use client";

import React, { useState, useEffect, useRef } from "react";
import HTMLFlipBook from "react-pageflip";
import { convertPdfToImages } from "../../utils/pdfToImages";
import { useSearchParams } from "next/navigation";

// Client-side wrapper component to safely handle searchParams
const ClientFlipBook = ({ fileUrl, cover, storyId, onProgress }: { fileUrl: string; cover: string; storyId: string; onProgress?: (currentPage: number, totalPages: number) => void }) => {
  const searchParams = useSearchParams();
  const assignmentId = searchParams.get('assignmentId');
  
  return (
    <FlipBook 
      fileUrl={fileUrl} 
      cover={cover} 
      storyId={storyId} 
      onProgress={onProgress} 
      assignmentId={assignmentId} 
    />
  );
};

// Main FlipBook component that doesn't directly use searchParams
const FlipBook = ({ 
  fileUrl, 
  cover, 
  storyId, 
  onProgress, 
  assignmentId 
}: { 
  fileUrl: string; 
  cover: string; 
  storyId: string; 
  onProgress?: (currentPage: number, totalPages: number) => void;
  assignmentId?: string | null;
}) => {
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastSentRef = useRef<{ page: number; ts: number } | null>(null);
  const [startPage, setStartPage] = useState<number>(0);
  const bookRef = useRef<any>(null);

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

  useEffect(() => {
    // Fetch existing progress if any
    const loadProgress = async () => {
      try {
        if (!storyId) return;
        const res = await fetch(`/api/reading-progress?storyId=${storyId}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.progress?.currentPage && typeof data.progress.currentPage === "number") {
          // HTMLFlipBook uses 0-based page index; our DB stores 1-based including cover
          const start = Math.max(0, (data.progress.currentPage as number) - 1);
          setStartPage(start);
        }
      } catch {}
    };
    loadProgress();
  }, [storyId]);

  // When pages are loaded or startPage changes, emit initial progress
  useEffect(() => {
    const total = pageImages.length + 1; // cover + images
    if (total > 0) {
      const currentOneBased = Math.min(total, Math.max(1, startPage + 1));
      console.log("currentBasedOne"+currentOneBased)
      onProgress?.(currentOneBased, total);
    }
  }, [pageImages.length, startPage]);

  const sendProgress = async (currentPage: number, totalPages: number) => {
    try {
      const now = Date.now();
      if (lastSentRef.current && now - lastSentRef.current.ts < 1000 && lastSentRef.current.page === currentPage) {
        return;
      }
      lastSentRef.current = { page: currentPage, ts: now };
      
      // Calculate progress percentage
      const progress = Math.round((currentPage / totalPages) * 100);
      
      // If we have an assignmentId, update the assignment progress
      if (assignmentId) {
        await fetch(`/api/student/assigned-books`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            assignmentId, 
            progress,
            isCompleted: progress >= 100
          }),
        });
      }
      
      // Always update general reading progress
      await fetch(`/api/reading-progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId, currentPage, totalPages }),
      });
    } catch (e) {
      // Silently ignore to avoid interrupting reading
      console.error("Error updating progress:", e);
    }
  };

  if (loading) {
    return <div className="loading-indicator">Loading PDF pages...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <HTMLFlipBook
      ref={bookRef}
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
      startPage={startPage}
      swipeDistance={30}
      clickEventForward={true}
      useMouseEvents={true}
      renderOnlyPageLengthChange={false}
      showPageCorners={true}
      disableFlipByClick={false}
      onFlip={(e: any) => {
        const total = pageImages.length + 1; // cover + images
        const apply = (zeroIndex: number) => {
          const currentOneBased = Math.min(total, Math.max(1, zeroIndex + 1));
          if (storyId) {
            sendProgress(currentOneBased, total);
          }
          console.log(currentOneBased)
          onProgress?.(currentOneBased, total);
        };

        if (e && typeof e.data?.page === "number") {
          // Prefer the event-provided target page index
          apply(e.data.page);
        } else {
          // Read on next tick to ensure flipbook updates its internal index
          setTimeout(() => {
            try {
              const api = bookRef.current?.pageFlip?.();
              if (api && typeof api.getCurrentPageIndex === "function") {
                apply(api.getCurrentPageIndex());
              }
            } catch {}
          }, 0);
        }
      }}
    >
      {/* Cover page */}
      <div className=" pdf-page">
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

export default ClientFlipBook;
