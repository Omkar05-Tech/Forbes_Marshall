// src/components/ImageCropper.jsx

import React, { useState, useRef } from 'react';
import { Crop, Maximize2, X } from 'lucide-react';
import { getCroppedImg } from './cropUtils';

const ImageCropper = ({ imageSrc, activeTask, onCropComplete, onCancel }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentBox, setCurrentBox] = useState(null); // { x, y, width, height }
  
  const imgRef = useRef(null);
  const containerRef = useRef(null);

  // --- Helpers ---
  const getRelativeCoords = (e) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  // --- Mouse Handlers ---
  const handleMouseDown = (e) => {
    if (!activeTask) return;
    // Don't start drawing if we clicked a button
    if (e.target.closest('button')) return;

    e.preventDefault();
    const coords = getRelativeCoords(e);
    setIsDrawing(true);
    setStartPos(coords);
    // Reset box to start point
    setCurrentBox({ x: coords.x, y: coords.y, width: 0, height: 0 });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !activeTask) return;
    e.preventDefault();
    const coords = getRelativeCoords(e);
    
    const width = coords.x - startPos.x;
    const height = coords.y - startPos.y;

    setCurrentBox({
      x: width > 0 ? startPos.x : coords.x,
      y: height > 0 ? startPos.y : coords.y,
      width: Math.abs(width),
      height: Math.abs(height)
    });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  // --- Action Handlers ---
  const handleConfirmCrop = async (e) => {
    // Stop event from bubbling to container
    e.stopPropagation();
    e.preventDefault();

    if (!imgRef.current || !currentBox) return;
    if (currentBox.width < 5 || currentBox.height < 5) return; // Ignore tiny accidental clicks

    try {
      // 1. Generate the Visual Preview (Base64)
      // This is what the User sees on the dashboard
      const croppedDataUrl = await getCroppedImg(imgRef.current, currentBox);

      // 2. NEW LOGIC: Calculate Scale Factors
      // (Original Image Size / Screen Display Size)
      const image = imgRef.current;
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      // 3. Calculate Real Coordinates for Backend [x1, y1, x2, y2]
      const realX = Math.round(currentBox.x * scaleX);
      const realY = Math.round(currentBox.y * scaleY);
      const realWidth = Math.round(currentBox.width * scaleX);
      const realHeight = Math.round(currentBox.height * scaleY);

      const cropCoordinates = [
        realX,
        realY,
        realX + realWidth,
        realY + realHeight
      ];

      // 4. Pass BOTH arguments to the parent (App.js)
      // arg1: visual image, arg2: backend coordinates
      onCropComplete(croppedDataUrl, cropCoordinates);
      
      setCurrentBox(null);
    } catch (err) {
      console.error("Crop failed:", err);
    }
  };

  const handleClearSelection = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentBox(null);
  };

  return (
    <div className="flex-1 relative bg-gray-100 overflow-auto flex items-center justify-center p-8 select-none">
      
      {/* Workspace State */}
      {!imageSrc ? (
        <div className="text-gray-400 flex flex-col items-center animate-in fade-in zoom-in duration-300">
          <Maximize2 className="w-16 h-16 mb-4 opacity-20" />
          <p>Please upload a drawing to begin inspection</p>
        </div>
      ) : (
        <div 
          ref={containerRef}
          className={`relative shadow-2xl bg-white inline-block select-none ${activeTask ? 'cursor-crosshair' : 'cursor-default'}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Base Image */}
          <img 
            ref={imgRef}
            src={imageSrc} 
            alt="Engineering Drawing" 
            className="max-h-[85vh] max-w-full block"
            draggable={false}
            crossOrigin="anonymous" 
          />

          {/* The Crop Box */}
          {currentBox && currentBox.width > 0 && (
            <div
              className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] z-10"
              style={{
                left: currentBox.x,
                top: currentBox.y,
                width: currentBox.width,
                height: currentBox.height,
              }}
            >
              {/* Box Handles for Visual Clarity */}
              <div className="absolute -top-1 -left-1 w-2 h-2 bg-indigo-500" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-indigo-500" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-indigo-500" />

              {/* Action Buttons */}
              {!isDrawing && (
                <div 
                  className="absolute -bottom-14 left-1/2 transform -translate-x-1/2 flex space-x-2 z-50 pointer-events-auto"
                  onMouseDown={(e) => e.stopPropagation()} // Extra safety
                >
                  <button
                    onClick={handleConfirmCrop}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white text-xs font-bold uppercase rounded-full shadow-lg hover:bg-indigo-700 transition-transform active:scale-95"
                  >
                    <Crop className="w-4 h-4 mr-1" />
                    Crop This
                  </button>
                  <button
                    onClick={handleClearSelection}
                    className="p-2 bg-white text-gray-700 rounded-full shadow-lg hover:bg-gray-100 transition-transform active:scale-95"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Instruction Tooltip (Follows Image) */}
          {activeTask && !currentBox && !isDrawing && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-indigo-600/90 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg pointer-events-none backdrop-blur-sm">
              Draw a box around: <span className="font-bold">{activeTask.label}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageCropper;