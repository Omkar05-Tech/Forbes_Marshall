import React from 'react';
import { Upload, ChevronDown, RotateCw, RotateCcw } from 'lucide-react'; // Import Rotate Icons
import TaskSidebar from './TaskSidebar';
import ImageCropper from './ImageCropper';

const Dashboard = ({
  imageSrc,
  tasks,
  activeTaskId,
  selectedComponent,
  templateKeys,
  
  onImageUpload,
  onComponentChange,
  onSelectTask,
  onCropComplete,
  onDeleteCrop,
  onCancelCrop,
  onSubmit,
  onRotate // New Prop
}) => {
  
  const activeTask = tasks?.find(t => t.id === activeTaskId);

  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-hidden font-sans text-gray-900">
      
      {/* Left Panel: Image Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm z-10">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                 <Upload className="w-5 h-5 text-white" />
              </div>
              <h1 className="font-bold text-lg text-gray-800 tracking-tight hidden md:block">TechDraw Inspector</h1>
            </div>

            <div className="relative group">
               {/* (Component Select - Same as before) */}
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-xs font-bold text-gray-400">TYPE:</span>
              </div>
              <select 
                value={selectedComponent}
                onChange={onComponentChange}
                className="pl-14 pr-10 py-1.5 border border-gray-300 rounded-md text-sm font-semibold text-gray-700 bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none cursor-pointer hover:bg-white transition-colors"
              >
                {templateKeys.map(key => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            
            {/* ROTATE CONTROLS (Only show if image exists) */}
            {imageSrc && (
              <div className="flex items-center bg-gray-100 rounded-lg p-1 border border-gray-200">
                <button 
                  onClick={() => onRotate('CCW')}
                  className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-white rounded-md transition-all"
                  title="Rotate Left"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                <button 
                  onClick={() => onRotate('CW')}
                  className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-white rounded-md transition-all"
                  title="Rotate Right"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* UPLOAD BUTTON */}
            <label className="cursor-pointer bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center border border-indigo-200">
              <Upload className="w-4 h-4 mr-2" />
              {imageSrc ? 'Change Drawing' : 'Upload File'}
              {/* Accept PDF and Images */}
              <input type="file" accept="image/*,application/pdf" onChange={onImageUpload} className="hidden" />
            </label>
          </div>
        </header>

        <ImageCropper 
          imageSrc={imageSrc} 
          activeTask={activeTask}
          onCropComplete={onCropComplete}
          onCancel={onCancelCrop}
        />
      </div>

      <TaskSidebar 
        tasks={tasks} 
        activeTaskId={activeTaskId} 
        onSelectTask={onSelectTask}
        onDeleteCrop={onDeleteCrop}
        onSubmit={onSubmit} 
      />

    </div>
  );
};

export default Dashboard;