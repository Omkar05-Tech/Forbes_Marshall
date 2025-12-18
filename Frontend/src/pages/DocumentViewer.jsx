import React, { useState, useEffect, useRef } from 'react';
// Import your existing processFile helper here
import { processFile } from './utils'; // Assuming the previous code is in utils.js

const DocumentViewer = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [activeHighlight, setActiveHighlight] = useState(null);
  const containerRef = useRef(null);

  // --- DUMMY BACKEND DATA ---
  // Coordinates format: [x, y, width, height] (normalized 0-1 or pixel values)
  // Let's assume these are PIXEL values relative to the original image size for this example.
  // If your backend sends normalized (0-1) values, we just multiply by width/height.
  const extractedData = [
    { id: 1, label: "Invoice Number", value: "INV-2024-001", coords: { x: 150, y: 200, w: 300, h: 50 } },
    { id: 2, label: "Total Amount", value: "$4,500.00", coords: { x: 800, y: 1100, w: 200, h: 60 } },
    { id: 3, label: "Date", value: "24-Nov-2025", coords: { x: 150, y: 300, w: 250, h: 40 } },
  ];

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const result = await processFile(file); // Your existing function
      setImageSrc(result);
    }
  };

  return (
    <div className="flex gap-6 p-4 h-screen bg-gray-100">
      
      {/* LEFT SIDE: THE IMAGE VIEWER */}
      <div className="flex-1 bg-white shadow-lg rounded-lg overflow-auto relative flex justify-center items-start p-4">
        {imageSrc ? (
          <div className="relative inline-block" ref={containerRef}>
            {/* The Main Image */}
            <img 
              src={imageSrc} 
              alt="Document" 
              className="max-w-full h-auto block" 
              style={{ maxHeight: '85vh' }}
            />

            {/* The Glowing Overlay Box */}
            {activeHighlight && (
              <div
                className="absolute border-2 border-yellow-400 bg-yellow-400/30 transition-all duration-300 ease-in-out pointer-events-none z-10"
                style={{
                  // We need to scale these if the image is responsive. 
                  // For a simple start, we assume 1:1 mapping or use percentage based on image container.
                  // *See the note below on Coordinate Scaling*
                  left: `${activeHighlight.x}px`,
                  top: `${activeHighlight.y}px`,
                  width: `${activeHighlight.w}px`,
                  height: `${activeHighlight.h}px`,
                  boxShadow: "0 0 15px 5px rgba(250, 204, 21, 0.8)", // The "Glow" effect
                  borderRadius: "4px"
                }}
              />
            )}
          </div>
        ) : (
          <div className="text-gray-400 mt-20">Upload a file to view</div>
        )}
      </div>

      {/* RIGHT SIDE: THE DATA PANEL */}
      <div className="w-1/3 bg-white shadow-lg rounded-lg p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-4">Extracted Data</h2>
        
        <input 
          type="file" 
          onChange={handleFileUpload} 
          className="mb-6 border p-2 w-full rounded"
        />

        <div className="space-y-4">
          {extractedData.map((item) => (
            <div 
              key={item.id}
              className={`p-3 border rounded cursor-pointer transition-colors ${
                activeHighlight === item.coords ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200' : 'hover:bg-gray-50'
              }`}
              onClick={() => setActiveHighlight(item.coords)}
            >
              <p className="text-xs text-gray-500 font-semibold uppercase">{item.label}</p>
              <p className="text-lg font-medium text-gray-800">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;