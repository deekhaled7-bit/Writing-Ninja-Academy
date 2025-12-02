"use client";

import React, { useState, useEffect, useRef } from "react";
import HTMLFlipBook from "react-pageflip";
import { convertPdfToImages } from "../../utils/pdfToImages";
import { useSearchParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";
// Add a small delay utility
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Client-side wrapper component to safely handle searchParams
const ClientFlipBook = ({
  fileUrl,
  cover,
  storyId,
  onProgress,
  isFullScreen = false,
}: {
  fileUrl: string;
  cover: string;
  storyId: string;
  onProgress?: (currentPage: number, totalPages: number) => void;
  isFullScreen?: boolean;
}) => {
  const searchParams = useSearchParams();
  const assignmentId = searchParams.get("assignmentId");

  return (
    <FlipBook
      fileUrl={fileUrl}
      cover={cover}
      storyId={storyId}
      onProgress={onProgress}
      assignmentId={assignmentId}
      isFullScreen={isFullScreen}
    />
  );
};

// Main FlipBook component that doesn't directly use searchParams
const FlipBook = ({
  fileUrl,
  cover,
  storyId,
  onProgress,
  assignmentId,
  isFullScreen = false,
}: {
  fileUrl: string;
  cover: string;
  storyId: string;
  onProgress?: (currentPage: number, totalPages: number) => void;
  assignmentId?: string | null;
  isFullScreen?: boolean;
}) => {
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastSentRef = useRef<{ page: number; ts: number } | null>(null);
  const [startPage, setStartPage] = useState<number>(0);
  const bookRef = useRef<any>(null);
  const [bookFinished, setBookFinished] = useState<boolean>(false);

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
        const res = await fetch(`/api/reading-progress?storyId=${storyId}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (
          data?.progress?.currentPage &&
          typeof data.progress.currentPage === "number"
        ) {
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
      console.log("currentBasedOne" + currentOneBased);
      onProgress?.(currentOneBased, total);
    }
  }, [pageImages.length, startPage]);

  const sendProgress = async (currentPage: number, totalPages: number) => {
    try {
      const now = Date.now();
      if (
        lastSentRef.current &&
        now - lastSentRef.current.ts < 1000 &&
        lastSentRef.current.page === currentPage
      ) {
        return;
      }
      lastSentRef.current = { page: currentPage, ts: now };

      // Consider the book complete if we're on the last page or beyond
      // This handles both even and odd page counts
      const isLastPage = currentPage >= totalPages - 1;

      // Calculate progress percentage, ensuring 100% when on the last page
      const progress = isLastPage
        ? 100
        : Math.round((currentPage / totalPages) * 100);

      console.log(
        `API Progress: Page ${currentPage}/${totalPages}, Progress: ${progress}%`
      );

      // If we have an assignmentId, update the assignment progress
      if (assignmentId) {
        await fetch(`/api/student/assigned-books`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assignmentId,
            progress,
            isCompleted: isLastPage || progress >= 100,
          }),
        });
      }

      // Always update general reading progress
      const rpRes = await fetch(`/api/reading-progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId, currentPage, totalPages }),
      });
      if (rpRes.ok) {
        const data = await rpRes.json();
        if (data?.awardedNinjaGold && data.awardedNinjaGold >= 10) {
          console.log("worked");
          toast({
            title: "Congratulations! You’ve earned 10 Ninja Gold!",
            className: "bg-amber-500 text-white border-amber-600",
          });
        }
      }
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
      className="flipBook "
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
      style={
        isFullScreen
          ? { transform: "scale(1.2)", transformOrigin: "center center" }
          : {}
      }
      startPage={startPage}
      swipeDistance={1} // Extremely reduced swipe distance for very easy swiping
      clickEventForward={true}
      useMouseEvents={true}
      renderOnlyPageLengthChange={false}
      showPageCorners={true}
      disableFlipByClick={false}
      onFlip={(e: any) => {
        // Add 1 for cover page
        const total = pageImages.length + 1;

        const apply = async (zeroIndex: number) => {
          console.log(
            `Current page index: ${zeroIndex}, Total pages: ${total}, Images: ${pageImages.length}`
          );

          // For a 3-page book (cover + 2 content pages), indices are 0, 1, 2
          // We need to consider the second content page (index = 2) as the last page
          // Apply different logic based on screen size
          const isLastPage =
            window.innerWidth >= 768
              ? zeroIndex >= pageImages.length - 1 // For md screens and larger
              : zeroIndex >= pageImages.length; // For smaller screens

          // Calculate 1-based page number for display and progress
          const currentOneBased = zeroIndex + 1;

          console.log(
            `Is last page: ${isLastPage}, Current page (1-based): ${currentOneBased}`
          );

          // Update progress immediately
          if (storyId) {
            // Force 100% progress when on last page
            const progressValue = isLastPage
              ? 100
              : Math.round((currentOneBased / total) * 100);
            console.log(`Sending progress: ${progressValue}%`);

            sendProgress(isLastPage ? total : currentOneBased, total);
          }

          onProgress?.(isLastPage ? total : currentOneBased, total);

          // Handle book completion
          if (isLastPage && !bookFinished) {
            console.log("Book finished, will return to cover soon");
            setBookFinished(true);

            // Return to cover after a delay
            await delay(2000);

            try {
              const api = bookRef.current?.pageFlip?.();
              if (api && typeof api.flip === "function") {
                console.log("Flipping back to cover");
                api.flip(0); // Flip back to cover (index 0)
              }
            } catch (err) {
              console.error("Error flipping to cover:", err);
            }
          }
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
