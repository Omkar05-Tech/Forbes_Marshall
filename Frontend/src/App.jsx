// import './App.css';
// import React, { useState } from 'react';
// import VerificationPage from './components/VerificationPage';
// import Dashboard from './components/DashBoard';
// import { processFile, rotateImage } from './utils/fileHelpers';
// import { uploadAndProcessImage, generateFinalReport } from './services/api'; 

// const COMPONENT_TEMPLATES = {
//     'SEAT': [
//       { id: 'cv1', label: 'Profile View', croppedImage: null },
//       { id: 'cv2', label: 'Table View', croppedImage: null }
//     ], 
//     'Control Valve': [
//       { id: 'cv1', label: 'Valve Body', croppedImage: null },
//       { id: 'cv2', label: 'Bonnet Flange', croppedImage: null },
//       { id: 'cv3', label: 'Stem Assembly', croppedImage: null },
//       { id: 'cv4', label: 'Actuator Mount', croppedImage: null },
//     ],
//     'Centrifugal Pump': [
//       { id: 'cp1', label: 'Impeller Casing', croppedImage: null },
//       { id: 'cp2', label: 'Suction Nozzle', croppedImage: null },
//       { id: 'cp3', label: 'Discharge Flange', croppedImage: null },
//       { id: 'cp4', label: 'Mounting Feet', croppedImage: null },
//       { id: 'cp5', label: 'Nameplate', croppedImage: null },
//     ],
//     'Heat Exchanger': [
//       { id: 'he1', label: 'Tube Sheet', croppedImage: null },
//       { id: 'he2', label: 'Inlet Header', croppedImage: null },
//       { id: 'he3', label: 'Outlet Header', croppedImage: null },
//     ]
//   };

// export default function App() {
//   const [imageSrc, setImageSrc] = useState(null);
//   const [activeTaskId, setActiveTaskId] = useState(null);
//   const [view, setView] = useState('workspace'); 
//   const [isProcessing, setIsProcessing] = useState(false);

//   const [selectedComponent, setSelectedComponent] = useState('SEAT');
//   const [tasks, setTasks] = useState(COMPONENT_TEMPLATES['SEAT']);

//   // --- HANDLERS ---

//   // 1. Handle Component Type Change
//   const handleComponentChange = (e) => {
//     const newComponent = e.target.value;
//     // If we have an image and tasks in progress, warn the user
//     if (imageSrc && tasks.some(t => t.croppedImage)) {
//         const confirmChange = window.confirm("Changing component type will reset current progress. Continue?");
//         if (!confirmChange) return;
//     }
    
//     setSelectedComponent(newComponent);
//     // Deep copy to ensure fresh state
//     setTasks(JSON.parse(JSON.stringify(COMPONENT_TEMPLATES[newComponent])));
//     setActiveTaskId(null);
//   };

//   // 2. Handle File Upload (PDF or Image)
//   const handleImageUpload = async (e) => {
//     if (e.target.files && e.target.files.length > 0) {
//       setIsProcessing(true);
//       try {
//         const file = e.target.files[0];
//         const processedImageSrc = await processFile(file);
//         setImageSrc(processedImageSrc);
//         setActiveTaskId(null);
//         // Reset tasks when a new image is uploaded (optional, depends on workflow)
//         setTasks(JSON.parse(JSON.stringify(COMPONENT_TEMPLATES[selectedComponent])));
//       } catch (error) {
//         console.error("Error processing file:", error);
//         alert("Failed to load file. If using PDF, ensure it is not password protected.");
//       } finally {
//         setIsProcessing(false);
//       }
//     }
//   };

//   // 3. Handle Rotation
//   const handleRotate = async (direction) => {
//     if (!imageSrc) return;
//     setIsProcessing(true);
//     try {
//       const newImageSrc = await rotateImage(imageSrc, direction);
//       setImageSrc(newImageSrc);
      
//       // Note: Rotating usually invalidates existing crop coordinates. 
//       // You might want to warn the user or clear crops here if strict accuracy is needed.
//     } catch (error) {
//       console.error("Rotation failed:", error);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   // 4. Task Selection
//   const handleSelectTask = (id) => {
//     if (!imageSrc) {
//       alert("Please upload an engineering drawing first.");
//       return;
//     }
//     setActiveTaskId(id);
//   };

//   // 5. Crop Completion
//   const handleCropComplete = (croppedDataUrl) => {
//     setTasks((prev) => 
//       prev.map(task => 
//         task.id === activeTaskId ? { ...task, croppedImage: croppedDataUrl } : task
//       )
//     );
//     setActiveTaskId(null);
//   };

//   // 6. Delete Crop
//   const handleDeleteCrop = (taskId) => {
//     setTasks((prev) =>
//       prev.map(task =>
//         task.id === taskId ? { ...task, croppedImage: null } : task
//       )
//     );
//     if(activeTaskId === taskId) setActiveTaskId(null);
//   };

//   // 7. Navigation to Verification
//   const handleSubmitInspection = () => {
//     setView('verification');
//   };

//   // 8. Final Backend Submit
//   const handleFinalSubmit = (data) => {
//     console.log("FINAL SUBMISSION TO BACKEND:", data);
//     alert(`Success! Data for ${data.component} saved.`);
//     // Reset or redirect logic here
//     setView('workspace');
//     setImageSrc(null);
//     setTasks(JSON.parse(JSON.stringify(COMPONENT_TEMPLATES[selectedComponent])));
//   };

//   // --- RENDER ---

//   if (view === 'verification') {
//     return (
//       <VerificationPage 
//         tasks={tasks} 
//         componentName={selectedComponent}
//         onBack={() => setView('workspace')} 
//         onFinalSubmit={handleFinalSubmit}
//       />
//     );
//   }

//   return (
//     <>
//       {isProcessing && (
//         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center text-white font-bold backdrop-blur-sm">
//           <div className="flex flex-col items-center">
//              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mb-2"></div>
//              Processing Document...
//           </div>
//         </div>
//       )}

//       <Dashboard 
//         imageSrc={imageSrc}
//         tasks={tasks}
//         activeTaskId={activeTaskId}
//         selectedComponent={selectedComponent}
//         templateKeys={Object.keys(COMPONENT_TEMPLATES)}
        
//         onImageUpload={handleImageUpload}
//         onComponentChange={handleComponentChange}
//         onSelectTask={handleSelectTask}
//         onCropComplete={handleCropComplete}
//         onDeleteCrop={handleDeleteCrop}
//         onCancelCrop={() => setActiveTaskId(null)}
//         onSubmit={handleSubmitInspection}
//         onRotate={handleRotate}
//       />
//     </>
//   );
// }

import './App.css';
import React, { useState } from 'react';
import VerificationPage from './components/VerificationPage';
import Dashboard from './components/Dashboard';
import { processFile, rotateImage } from './utils/fileHelpers';
import { uploadAndProcessImage, generateFinalReport } from './services/api'; // Import API

const COMPONENT_TEMPLATES = {
    '25NB_300_SEAT': [
      { id: 's_cv1', label: 'Profile View', croppedImage: null, coordinates: null },
      { id: 's_cv2', label: 'Table View', croppedImage: null, coordinates: null }
    ],
    'M45_300_SLOTTED_NUT': [ 
      { id: 'sn_cv1', label: 'Profile View', croppedImage: null, coordinates: null }
    ],
    '80NB_300_CAGE': [
      { id: 'c_cv1', label: 'Cage Profile View', croppedImage: null, coordinates: null },
      { id: 'c_cv2', label: 'Cage Table & Title Block', croppedImage: null, coordinates: null }
    ],
    'EXT_TOP': [
      { id: 'et_cv1', label: 'First Side Operations', croppedImage: null, coordinates: null },
      { id: 'et_cv2', label: 'Second Side Operations', croppedImage: null, coordinates: null },
      { id: 'et_cv3', label: 'Drilling Operations', croppedImage: null, coordinates: null },
    ],
    'ADJ_BOLT': [
      { id: 'ab_cv1', label: 'Adjustment Bolt Profile', croppedImage: null, coordinates: null },
      { id: 'ab_cv2', label: 'Adjustment Bolt Table', croppedImage: null, coordinates: null }
    ],
    'GLAND_NUT': [
      { id: 'gn_cv1', label: 'Left Profile View', croppedImage: null, coordinates: null },
      { id: 'gn_cv2', label: 'Right Profile View', croppedImage: null, coordinates: null },
      { id: 'gn_cv3', label: 'Tolerance Table', croppedImage: null, coordinates: null }
    ],
    'PLUG': [
      { id: 'p_cv1', label: 'Thread End (1st Side)', croppedImage: null, coordinates: null },
      { id: 'p_cv2', label: 'Plug Head (2nd Side)', croppedImage: null, coordinates: null },
      { id: 'p_cv3', label: 'Tolerance Table', croppedImage: null, coordinates: null }
    ],
    '80MM_300_FLANGE_BODY': [
      { id: 'fb_cv1', label: 'Main Bore View', croppedImage: null, coordinates: null },
      { id: 'fb_cv2', label: 'Side Flange (8-Hole)', croppedImage: null, coordinates: null },
      { id: 'fb_cv3', label: 'Top Flange (4-Hole)', croppedImage: null, coordinates: null },
      { id: 'fb_cv4', label: 'Tolerance Tables', croppedImage: null, coordinates: null }
    ]
    // --- IGNORE ---
    
};

export default function App() {
  const [imageSrc, setImageSrc] = useState(null);
  const [originalFile, setOriginalFile] = useState(null); // NEW: Store raw file
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [view, setView] = useState('workspace'); 
  const [isProcessing, setIsProcessing] = useState(false);
  
  // NEW: Store backend response data
  const [uploadId, setUploadId] = useState(null);
  const [geminiResults, setGeminiResults] = useState(null);

  const [selectedComponent, setSelectedComponent] = useState('25NB_300_SEAT', 'M45_300_SLOTTED_NUT', '80NB_300_CAGE', 'EXT_TOP', 'ADJ_BOLT', 'GLAND_NUT', 'PLUG', '80MM_300_FLANGE_BODY');
  // Initialize tasks based on the template
  const [tasks, setTasks] = useState(COMPONENT_TEMPLATES['25NB_300_SEAT', 'M45_300_SLOTTED_NUT', '80NB_300_CAGE', 'EXT_TOP', 'ADJ_BOLT', 'GLAND_NUT', 'PLUG', '80MM_300_FLANGE_BODY']);

  // --- HANDLERS ---
  const handleComponentChange = (e) => {
    const newComponent = e.target.value;
    if (imageSrc && tasks.some(t => t.croppedImage)) {
        const confirmChange = window.confirm("Changing component type will reset current progress. Continue?");
        if (!confirmChange) return;
    }
    setSelectedComponent(newComponent);
    setTasks(JSON.parse(JSON.stringify(COMPONENT_TEMPLATES[newComponent])));
    setActiveTaskId(null);
  };

  const handleImageUpload = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsProcessing(true);
      try {
        const file = e.target.files[0];
        setOriginalFile(file); // Save the raw file for API upload
        
        const processedImageSrc = await processFile(file);
        setImageSrc(processedImageSrc);
        setActiveTaskId(null);
        setTasks(JSON.parse(JSON.stringify(COMPONENT_TEMPLATES[selectedComponent])));
      } catch (error) {
        console.error("Error processing file:", error);
        alert("Failed to load file.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleRotate = async (direction) => {
    if (!imageSrc) return;
    setIsProcessing(true);
    try {
      const newImageSrc = await rotateImage(imageSrc, direction);
      setImageSrc(newImageSrc);
      // Note: Rotation usually invalidates coordinates. You might need to reset them.
    } catch (error) {
      console.error("Rotation failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectTask = (id) => {
    if (!imageSrc) {
      alert("Please upload an engineering drawing first.");
      return;
    }
    setActiveTaskId(id);
  };

  // CRITICAL UPDATE: Expect coordinates from the child component
  // coordinates format expected: [x1, y1, x2, y2]
  const handleCropComplete = (croppedDataUrl, cropCoordinates) => {
    setTasks((prev) => 
      prev.map(task => 
        task.id === activeTaskId ? { 
            ...task, 
            croppedImage: croppedDataUrl, 
            coordinates: cropCoordinates // Save coordinates for backend
        } : task
      )
    );
    setActiveTaskId(null);
  };

  const handleDeleteCrop = (taskId) => {
    setTasks((prev) =>
      prev.map(task =>
        task.id === taskId ? { ...task, croppedImage: null, coordinates: null } : task
      )
    );
    if(activeTaskId === taskId) setActiveTaskId(null);
  };

  // --- API INTEGRATION: SUBMIT INSPECTION ---
  const handleSubmitInspection = async () => {
    // 1. Validation: Ensure all tasks have crops
    const incompleteTasks = tasks.filter(t => !t.coordinates);
    if (incompleteTasks.length > 0) {
        alert(`Please crop the following zones before submitting: ${incompleteTasks.map(t => t.label).join(', ')}`);
        return;
    }

    setIsProcessing(true);

    try {
        // 2. Format data for Backend
        // Backend expects dict: { 'zone_key': [x1, y1, x2, y2] }
        const cropData = {};
        tasks.forEach(task => {
            cropData[task.id] = task.coordinates;
        });

        // 3. Call API
        console.log("Sending to backend:", { selectedComponent, cropData });
        const result = await uploadAndProcessImage(originalFile, selectedComponent, cropData);

        // 4. Update State with Results
        setUploadId(result.uploadId);
        setGeminiResults(result.rawResults);

        // 5. Navigate
        setView('verification');

    } catch (error) {
        console.error("Backend Error:", error);
        alert(`Error processing image: ${error.response?.data?.detail || error.message}`);
    } finally {
        setIsProcessing(false);
    }
  };

  // --- API INTEGRATION: FINAL REPORT ---
  const handleFinalSubmit = async (validatedData) => {
    setIsProcessing(true);
    try {
        const result = await generateFinalReport(uploadId, validatedData);
        alert(`Success! Report generated: \n${result.final_description}`);
        
        // Reset
        setView('workspace');
        setImageSrc(null);
        setOriginalFile(null);
        setTasks(JSON.parse(JSON.stringify(COMPONENT_TEMPLATES[selectedComponent])));
    } catch (error) {
        console.error("Report Generation Error:", error);
        alert("Failed to generate report.");
    } finally {
        setIsProcessing(false);
    }
  };

  // --- RENDER ---

  if (view === 'verification') {
    return (
      <VerificationPage 
        tasks={tasks} 
        componentName={selectedComponent}
        geminiResults={geminiResults} // Pass API results to Verification
        onBack={() => setView('workspace')} 
        onFinalSubmit={handleFinalSubmit}
      />
    );
  }

  return (
    <>
      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center text-white font-bold backdrop-blur-sm">
          <div className="flex flex-col items-center">
             <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mb-2"></div>
             Processing Document...
          </div>
        </div>
      )}

      <Dashboard 
        imageSrc={imageSrc}
        tasks={tasks}
        activeTaskId={activeTaskId}
        selectedComponent={selectedComponent}
        templateKeys={Object.keys(COMPONENT_TEMPLATES)}
        
        onImageUpload={handleImageUpload}
        onComponentChange={handleComponentChange}
        onSelectTask={handleSelectTask}
        onCropComplete={handleCropComplete} // Needs to pass (dataUrl, [x1,y1,x2,y2])
        onDeleteCrop={handleDeleteCrop}
        onCancelCrop={() => setActiveTaskId(null)}
        onSubmit={handleSubmitInspection} // Now triggers API
        onRotate={handleRotate}
      />
    </>
  );
}