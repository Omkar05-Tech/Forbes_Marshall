import React, { useState } from 'react';
import WorkspacePage from './components/WorkspacePage';
import VerificationPage from './components/VerificationPage';
import DescriptionPage from './components/DescriptionPage';
import { processFile } from './utils/fileHelpers';

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
      { id: 'fb_cv4', label: 'Tables', croppedImage: null, coordinates: null }
    ]
};

export default function App() {
  const [view, setView] = useState('workspace'); 
  const [imageSrc, setImageSrc] = useState(null);
  const [originalFile, setOriginalFile] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState('25NB_300_SEAT');
  const [tasks, setTasks] = useState(COMPONENT_TEMPLATES['25NB_300_SEAT']);
  
  // Data passed between pages
  const [uploadId, setUploadId] = useState(null);
  const [geminiResults, setGeminiResults] = useState(null);
  const [finalDescription, setFinalDescription] = useState("");

  const resetApp = () => {
    setView('workspace');
    setImageSrc(null);
    setOriginalFile(null);
    setTasks(JSON.parse(JSON.stringify(COMPONENT_TEMPLATES[selectedComponent])));
  };

  if (view === 'description') {
    return <DescriptionPage description={finalDescription} onReset={resetApp} />;
  }

  if (view === 'verification') {
    return (
      <VerificationPage 
        tasks={tasks} 
        componentName={selectedComponent}
        geminiResults={geminiResults}
        uploadId={uploadId}
        onBack={() => setView('workspace')} 
        onFinish={(desc) => {
            setFinalDescription(desc);
            setView('description');
        }}
      />
    );
  }

  return (
    <WorkspacePage 
      imageSrc={imageSrc}
      setImageSrc={setImageSrc}
      originalFile={originalFile}
      setOriginalFile={setOriginalFile}
      tasks={tasks}
      setTasks={setTasks}
      selectedComponent={selectedComponent}
      setSelectedComponent={setSelectedComponent}
      templateTemplates={COMPONENT_TEMPLATES}
      onStartVerification={(id, results) => {
        setUploadId(id);
        setGeminiResults(results);
        setView('verification');
      }}
    />
  );
}