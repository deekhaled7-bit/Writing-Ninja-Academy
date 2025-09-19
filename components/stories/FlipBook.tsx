import React from "react";
import HTMLFlipBook from "react-pageflip";

const FlipBook = () => {
  return (
    <HTMLFlipBook
      width={300}
      height={500}
      className="flipBook"
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
      <div className="page-content cover">
        <img
          src="https://res.cloudinary.com/daihz1quh/image/upload/v1758290733/story-covers/gi4zfkwqtccksxsybmdq.jpg    "
          alt="Cover"
          width={300}
          height={500}
        />
      </div>
      <div className="demoPage">Page 1</div>
      <div className="demoPage">Page 2</div>
      <div className="demoPage">Page 3</div>
      <div className="demoPage">Page 4</div>
    </HTMLFlipBook>
  );
};

export default FlipBook;
