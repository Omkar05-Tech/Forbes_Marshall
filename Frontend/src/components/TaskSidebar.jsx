import React from 'react';
import { CheckCircle, Circle, ScanLine, Trash2, ArrowRight } from 'lucide-react';

const TaskSidebar = ({ tasks, activeTaskId, onSelectTask, onDeleteCrop, onSubmit }) => {

  // --- FIX: Add fallback (|| []) to BOTH lines ---
  const safeTasks = tasks || []; 
  
  const completedCount = safeTasks.filter(t => t.croppedImage).length;
  const totalCount = safeTasks.length; // This was crashing before
  
  // Prevent division by zero if tasks haven't loaded
  const progress = totalCount === 0 ? 0 : (completedCount / totalCount) * 100;
  const isReadyToSubmit = totalCount > 0 && completedCount === totalCount;

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full shadow-xl z-20">
      <div className="p-6 border-b border-gray-100 bg-gray-50">
        <h2 className="text-xl font-bold text-gray-800">Inspection List</h2>
        <p className="text-sm text-gray-500 mt-1">Select a part to capture</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {safeTasks.map((task) => {
          const isActive = activeTaskId === task.id;
          const isComplete = !!task.croppedImage;

          return (
            <div 
              key={task.id}
              className={`
                relative rounded-xl border-2 transition-all duration-200 overflow-hidden group
                ${isActive ? 'border-indigo-600 bg-indigo-50 shadow-md ring-2 ring-indigo-200 ring-offset-2' : 'border-gray-200 bg-white hover:border-indigo-300'}
              `}
            >
              <button
                onClick={() => onSelectTask(task.id)}
                className="w-full text-left p-4 flex items-center justify-between outline-none"
              >
                <div className="flex items-center space-x-3">
                  {isComplete ? (
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                  ) : (
                    <Circle className={`w-5 h-5 shrink-0 ${isActive ? 'text-indigo-600' : 'text-gray-300'}`} />
                  )}
                  <span className={`font-semibold ${isComplete ? 'text-gray-700' : 'text-gray-900'}`}>
                    {task.label}
                  </span>
                </div>
                {isActive && !isComplete && (
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded animate-pulse">
                    DRAW BOX
                  </span>
                )}
              </button>

              {isComplete && (
                <div className="px-4 pb-4 animate-in slide-in-from-top-2">
                  <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-100 group-hover:shadow-inner">
                    <img src={task.croppedImage} alt={task.label} className="w-full h-32 object-contain" />
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCrop(task.id);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200"
                      title="Retake Crop"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center text-sm text-gray-500 mb-2 justify-between">
            <div className="flex items-center">
              <ScanLine className="w-4 h-4 mr-2" />
              <span>Progress</span>
            </div>
            <span className="font-bold text-gray-700">{completedCount}/{totalCount}</span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${isReadyToSubmit ? 'bg-green-500' : 'bg-indigo-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={onSubmit}
          disabled={!isReadyToSubmit}
          className={`
            w-full py-3 px-4 rounded-lg font-bold flex items-center justify-center transition-all shadow-md
            ${isReadyToSubmit 
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg transform hover:-translate-y-0.5' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          <span>Review Inspection</span>
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default TaskSidebar;