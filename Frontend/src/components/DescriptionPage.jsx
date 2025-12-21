import React from 'react';
import { FileText, ArrowLeft, Download, CheckCircle } from 'lucide-react';

const DescriptionPage = ({ description, onReset }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-8 font-sans">
      <div className="max-w-3xl w-full bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="bg-indigo-600 p-8 text-white text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold">Inspection Complete</h1>
          <p className="opacity-80 mt-2">The final process description has been generated</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="flex items-center space-x-2 mb-4 text-gray-500 font-bold uppercase text-xs tracking-widest">
            <FileText className="w-4 h-4" />
            <span>Process Sheet Description</span>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 min-h-[300px] text-gray-800 leading-relaxed whitespace-pre-wrap font-mono text-sm">
            {description || "No description generated."}
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button 
              onClick={onReset}
              className="flex-1 flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-md active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              New Inspection
            </button>
            <button 
              onClick={() => window.print()}
              className="flex-1 flex items-center justify-center px-6 py-3 bg-white text-gray-700 font-bold rounded-lg border border-gray-300 hover:bg-gray-50 transition-all shadow-sm"
            >
              <Download className="w-5 h-5 mr-2" />
              Download / Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DescriptionPage;