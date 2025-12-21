import React, { useState } from 'react';
import axios from 'axios';
import Dashboard from './Dashboard';
import { processFile, rotateImage } from '../utils/fileHelpers';
import { API_BASE_URL } from '../services/api';

const WorkspacePage = ({ 
    imageSrc, setImageSrc, 
    originalFile, setOriginalFile, 
    tasks, setTasks, 
    selectedComponent, setSelectedComponent,
    templateTemplates,
    onStartVerification 
}) => {
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleComponentChange = (e) => {
    const newComp = e.target.value;
    setSelectedComponent(newComp);
    setTasks(JSON.parse(JSON.stringify(templateTemplates[newComp])));
  };

  const handleImageUpload = async (e) => {
    if (e.target.files?.[0]) {
      setIsProcessing(true);
      const file = e.target.files[0];
      setOriginalFile(file);
      const res = await processFile(file);
      setImageSrc(res);
      setTasks(JSON.parse(JSON.stringify(templateTemplates[selectedComponent])));
      setIsProcessing(false);
    }
  };

  const handleRotate = async (dir) => {
    const newImg = await rotateImage(imageSrc, dir);
    setImageSrc(newImg);
  };

  const handleCropComplete = (url, coords) => {
    setTasks(prev => prev.map(t => t.id === activeTaskId ? { ...t, croppedImage: url, coordinates: coords } : t));
    setActiveTaskId(null);
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    try {
      const cropData = {};
      tasks.forEach(t => { if(t.coordinates) cropData[t.id] = t.coordinates; });

      const formData = new FormData();
      formData.append('file', originalFile);
      formData.append('product_key', selectedComponent);
      formData.append('crop_data_json', JSON.stringify(cropData));

      const uploadRes = await axios.post(`${API_BASE_URL}/upload`, formData);
      const { upload_id } = uploadRes.data;
      
      const processRes = await axios.post(`${API_BASE_URL}/process/${upload_id}`);
      onStartVerification(upload_id, processRes.data.raw_results);
    } catch (err) {
      alert("Error processing drawing");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center text-white backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-t-transparent border-white rounded-full animate-spin mb-2"></div>
            Processing...
          </div>
        </div>
      )}
      <Dashboard 
        imageSrc={imageSrc}
        tasks={tasks}
        activeTaskId={activeTaskId}
        selectedComponent={selectedComponent}
        templateKeys={Object.keys(templateTemplates)}
        onImageUpload={handleImageUpload}
        onComponentChange={handleComponentChange}
        onSelectTask={setActiveTaskId}
        onCropComplete={handleCropComplete}
        onDeleteCrop={(id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, croppedImage: null, coordinates: null } : t))}
        onCancelCrop={() => setActiveTaskId(null)}
        onSubmit={handleSubmit}
        onRotate={handleRotate}
      />
    </>
  );
};

export default WorkspacePage;