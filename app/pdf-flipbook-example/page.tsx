"use client";

import React, { useState } from "react";
import FlipBook from "../../components/stories/FlipBook";

export default function PdfFlipBookExample() {
  const [pdfUrl, setPdfUrl] = useState("");
  const [inputUrl, setInputUrl] = useState("");

  // Default cover image
  const coverImage = "/images/cover-placeholder.svg";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPdfUrl(inputUrl);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">
        PDF FlipBook Example
      </h1>

      <div className="mb-8 max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <div>
            <label htmlFor="pdfUrl" className="block mb-2 font-medium">
              Enter PDF URL:
            </label>
            <input
              type="text"
              id="pdfUrl"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://example.com/sample.pdf"
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Load PDF
          </button>
        </form>
      </div>

      {pdfUrl ? (
        <div className="flex justify-center">
          <FlipBook fileUrl={pdfUrl} cover={coverImage} />
        </div>
      ) : (
        <div className="text-center text-gray-500">
          Enter a PDF URL above to see it as a flipbook
        </div>
      )}

      <div className="mt-8 max-w-2xl mx-auto bg-gray-50 p-4 rounded">
        <h2 className="text-xl font-bold mb-2">Instructions:</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Enter the URL of a PDF file in the input field above</li>
          <li>Click &quot;Load PDF&quot; to convert the PDF into a flipbook</li>
          <li>Use your mouse to flip through the pages</li>
          <li>
            The first page will be the cover image, followed by the PDF pages
          </li>
        </ol>
        <p className="mt-4 text-sm text-gray-600">
          Note: For security reasons, some PDFs might be blocked by CORS
          policies. Try using PDFs from the same domain or from sources that
          allow cross-origin requests.
        </p>
      </div>
    </div>
  );
}
