import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ArrowLeft, Save, Loader2, Edit3, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { API_BASE_URL } from '../services/api';

const DATA_MAPPING = {
  's_cv1': {
    'major_od': 'Major Diameter',
    'step_angle': 'Step Angle',
    'step_od': 'Step Diameter',
    'step_od_tol': 'Step Dia Tolerance',
    'step_len': 'Step Length',
    'step_len_tol': 'Step Len Tolerance',
    'drill_angle': 'Drill Angle',
    'bore_id': 'Bore ID (H7)',
    'total_len': 'Total Length',
    'total_len_tol_upper': 'Total Len (+)',
    'total_len_tol_lower': 'Total Len (-)',
  },
  's_cv2': {
    'd8_upper': 'Tolerance d8 (Upper)',
    'd8_lower': 'Tolerance d8 (Lower)',
  },
  'sn_cv1': {
    'total_len': 'Total Length',
    'thread_spec': 'Thread Specification',
    'chamfer_val': 'Chamfer Value'
  },
  'c_cv1': {
    'cage_id': 'Inner Diameter (H7)',
    'cage_od_body': 'Body OD (Positive)',
    'cage_od_body_tol': 'Body OD Tolerance',
    'control_length': 'Vertical Control Len',
    'control_length_tol': 'Control Len Tol',
    'lip_depth': 'Lip Depth (C-Bore)',
    'bz_val_1': 'BZ Value (Right)',
    'bz_val_2': 'BZ Value (Left)',
    'top_chf_len': 'Top Chamfer Length',
    'top_chf_angle': 'Top Chamfer Angle',
    'corner_chf_size': 'Corner Chamfer Size',
    'corner_chf_angle': 'Corner Chamfer Angle',
  },
  'c_cv2': {
    'h7_upper': 'H7 Upper Limit',
    'h7_lower': 'H7 Lower Limit',
  },
  'et_cv1': {
    'step1_dia': 'Step 1 Dia (f7)',
    'step1_len': 'Step 1 Length',
    'front_chamfer': 'Front Chamfer',
    'step2_dia': 'Step 2 Dia',
    'step2_len': 'Step 2 Length',
    'step3_dia': 'Step 3 Dia (f8)',
    'step3_len': 'Step 3 Length',
    'step4_dia': 'Step 4 Dia (d9)',
    'step4_len': 'Step 4 Length',
    'step5_dia': 'Step 5 Dia',
    'step5_len': 'Step 5 Length',
    'flange_dia': 'Max Flange OD',
    'flange_len': 'Flange Thickness',
    'back_chamfer': 'Back Chamfer',
    'center_drill_dia': 'Center Drill Dia',
    'center_drill_depth': 'Center Drill Depth',
    'small_bore_dia': 'Small Bore (h7)',
    'small_bore_depth': 'Small Bore Depth',
    'detail_relief_dia': 'Relief Dia',
    'detail_relief_angle': 'Relief Angle',
    'detail_relief_depth': 'Relief Depth',
    'detail_radius': 'Relief Radius',
  },
  'et_cv2': {
    'total_length': 'Total Length',
    'back_step1_dia': 'Back Step 1 Dia',
    'back_step1_len': 'Back Step 1 Length',
    'back_step2_dia': 'Back Step 2 Dia (h9)',
    'back_step2_len': 'Back Step 2 Length',
    'counter_bore_dia': 'Counter Bore Dia',
    'counter_bore_depth': 'Counter Bore Depth',
    'main_bore_dia': 'Main Bore (H7)',
    'main_bore_depth': 'Main Bore Depth',
    'ext_thread_spec': 'Ext Thread Spec',
    'ext_thread_len': 'Ext Thread Len',
    'int_thread_spec': 'Int Thread Spec',
    'int_thread_len': 'Int Thread Len',
    'groove_dist': 'Groove Distance',
    'groove_spec': 'Groove Spec',
  },
  'et_cv3': {
    'hole_count': 'Hole Count',
    'hole_diameter': 'Hole Diameter',
    'pcd_value': 'PCD Value',
  },
  'ab_cv1': {
    'bar_dia': 'Bar Diameter',
    'bar_len': 'Bar Length',
    'turn_dia_c9': 'Turn Dia (C9)',
    'turn_len_first_side': 'Turn Len (1st Side)',
    'chf_size': 'Chamfer Size',
    'chf_angle_1': 'Chamfer Angle 1',
    'drill_dia': 'Drill Dia',
    'bore_id_plus': 'Bore ID (+)',
    'bore_plus_tol': 'Bore Tol (+)',
    'cb_id_h11': 'C-Bore ID (H11)',
    'cb_len': 'C-Bore Depth',
    'r_cb': 'C-Bore Radius',
    'groove_width': 'Groove Width (d9)',
    'groove_start_len': 'Groove Start',
    'groove_end_len': 'Groove End',
    'sw_size': 'SW Size (Hex)',
    'chf_angle_2': 'Chamfer Angle 2',
    'tl_overall': 'Total Length',
    'turn_od': 'Turn OD (Side 2)',
    'drill_thru_dia': 'Drill Thru Dia',
    'groove_od_width': 'OD Groove Width',
    'bore_id_plus_2': 'Bore ID 2 (+)',
    'bore_plus_tol_2': 'Bore Tol 2 (+)',
    'r_bore': 'Bore Radius',
    'thread_dia': 'Thread Dia',
    'thread_pitch': 'Thread Pitch',
    'thread_class': 'Thread Class',
    'thread_len': 'Thread Depth',
    'groove_dia_final': 'Final Groove Dia',
    'groove_tol_upper': 'Final Groove Tol',
    'groove_final_width': 'Final Groove Width',
    'groove_final_width_tol': 'Final Groove Width Tol',
    'r_groove_final': 'Final Groove Radius',
    'r_groove_final_tol': 'Final Groove Rad Tol'
  },
  'ab_cv2': {
    'c9_lower': 'C9 Lower Limit',
    'c9_upper': 'C9 Upper Limit',
    'h11_upper': 'H11 Upper Limit',
    'h11_lower': 'H11 Lower Limit',
    'd9_lower': 'd9 Lower Limit',
    'd9_upper': 'd9 Upper Limit',
    'len_tol_upper': 'Len Tol Upper',
    'len_tol_lower': 'Len Tol Lower'
  },
  'gn_cv1': {
    'cb_dia_inner_h11': 'Inner CB Dia (H11)',
    'bore_dia_f8': 'Inner Bore Dia (F8)',
    'groove_dia_h8': 'Groove Dia (H8)',
    'groove_dia_large_angle': 'Large Angle Groove Dia',
    'turn_dia_largest_step': 'Largest Turn Dia',
    'step_dia_e5': 'Step Dia (e5)',
    'tl_overall': 'Total Length',
    'len_step_inner_cb': 'Inner CB Length',
    'len_groove_width_small': 'Small Groove Width',
    'step_depth_e5': 'Step Depth (e5)',
    'thread_spec': 'Thread Spec',
    'groove_angle_formb': 'Form B Angle'
  },
  'gn_cv2': {
    'bore_dia_h11_plus': 'Bore Dia (+0.1)',
    'groove_dia_neg_tol': 'Groove Dia (-0.1)',
    'len_cb_mid': 'Large CB Length',
    'groove_width_tol_plus': 'Wide Groove Width',
    'r_form_bore': 'Bore Form Radius',
    'groove_width_tol_value': 'Groove Width Tol',
    'r_thread_bottom': 'Thread Bottom Radius'
  },
  'gn_cv3': {
    'tol_h11_upper': 'H11 Upper Limit',
    'tol_f8_lower': 'F8 Lower Limit',
    'tol_h8_upper': 'H8 Upper Limit',
    'tol_e5_lower': 'e5 Lower Limit',
    'material_type': 'Material Type'
  },
  'p_cv1': {
    'shaft_dia_main': 'Shaft Main Dia',
    'rolling_len_text': 'Rolling Length',
    'shaft_len_to_undercut': 'Shaft Len to Undercut',
    'undercut_angle': 'Undercut Angle',
    'undercut_radius': 'Undercut Radius',
    'thread_callout': 'Thread Spec',
    'thread_section_len': 'Thread Section Len',
    'thread_end_chamfer': 'Thread Chamfer',
    'minor_dia_bracket': 'Minor Dia (Bracket)'
  },
  'p_cv2': {
    'overall_len': 'Total Overall Length',
    'head_dia': 'Head Diameter',
    'head_chamfer': 'Head Chamfer',
    'plug_taper_major_dia': 'Plug Taper Major Dia',
    'plug_taper_angle': 'Plug Taper Angle',
    'plug_taper_radius': 'Plug Radius',
    'plug_detail_len': 'Plug Detail Length',
    'surface_finish': 'Surface Roughness (Ra)',
    'marking_text': 'Engraving Text'
  },
  'p_cv3': {
    'tol_upper_limit': 'Tolerance Upper',
    'tol_lower_limit': 'Tolerance Lower',
    'tol_standard_ref': 'ISO Standard'
  },
  'fb_cv1': {
    'face_from_center_dim': 'Face from Center',
    'main_turn_thk': 'Top Flange Thickness',
    'main_chf_size': 'Main Chamfer Size',
    'main_chf_angle': 'Main Chamfer Angle',
    'main_chf_places': 'Chamfer Places',
    'main_bore_dia_h7': 'Bore Dia (H7)',
    'main_bore_dia_b11': 'Bore Dia (B11)',
    'cb_b11_depth': 'B11 Depth',
    'bore_dia_95': 'Small Bore (95)',
    'bore_dia_109': 'Bore Dia (109)',
    'cb_109_depth': '109 Depth',
    'cb_110_forming_dia': 'Forming Bore Dia',
    'chf_3_angle': 'Forming Chf Angle',
    'chf_3_size': 'Forming Chf Size',
    'flange_turn_dia_1': 'Left Flange Dia',
    'flange_step_dia': 'Step Turn Dia',
    'flange_step_thk': 'Step Turn Thk',
    'flange_chf_angle': 'Flange Chf Angle',
    'flange_chf_maint_dia': 'Flange Chf Maint Dia'
  },
  'fb_cv2': {
    'flange_2_pcd': 'Side PCD',
    'flange_2_count': 'Side Hole Count',
    'flange_2_dia': 'Side Hole Dia',
    'tap_size': 'Tap Size',
    'tap_hole_count': 'Tap Count',
    'side_flange_od': 'Side Flange OD'
  },
  'fb_cv3': {
    'flange_1_pcd': 'Top PCD',
    'flange_1_count': 'Top Hole Count',
    'flange_1_dia': 'Top Hole Dia',
    'top_flange_od': 'Top Flange OD',
    'chf_2_angle': 'Internal Chf Angle',
    'chf_2_size': 'Internal Chf Size'
  },
  'fb_cv4': {
    'face_from_center_tol': 'Center Tol (120-315)',
    'main_bore_h7_tol': 'H7 Tolerance',
    'main_bore_b11_tol': 'B11 Tolerance',
    'tabpanelowed_tol': 'Depth Tol (<6)',
    'bore_95_tol': 'Bore 95 Tol',
    'bore_tol_109': 'Bore 109 Tol',
    'cb_109_depth_tol': 'Depth Tol (6-30)',
    'flange_turn_tol_1': 'Flange Tol'
  }
};

const VerificationPage = ({ tasks, componentName, geminiResults, uploadId, onBack, onFinish }) => {
  const [items, setItems] = useState(() => 
    tasks.filter(t => t.croppedImage).map(task => ({
      id: task.id,
      label: task.label,
      croppedImage: task.croppedImage,
      isLoading: true, 
      data: [],      
      zoom: 1 
    }))
  );

  const [activeHighlight, setActiveHighlight] = useState(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (!geminiResults || hasProcessed.current) return;
    hasProcessed.current = true;

    setItems(prevItems => prevItems.map(item => {
      const allowedKeysMap = DATA_MAPPING[item.id] || {};
      const mappedData = [];
      
      Object.entries(allowedKeysMap).forEach(([backendKey, readableLabel]) => {
        if (geminiResults.hasOwnProperty(backendKey)) {
          const resultObj = geminiResults[backendKey];
          
          let finalValue = "N/A";
          let finalBox = { x: 0, y: 0, w: 0, h: 0 };

          if (resultObj && typeof resultObj === 'object' && 'value' in resultObj) {
             finalValue = String(resultObj.value ?? "N/A");
             finalBox = resultObj.box || { x: 0, y: 0, w: 0, h: 0 };
          } else {
             finalValue = String(resultObj ?? "N/A");
          }

          mappedData.push({
            key: readableLabel,
            originalKey: backendKey,
            value: finalValue,
            isEdited: false,
            box: finalBox 
          });
        }
      });

      return { ...item, isLoading: false, data: mappedData };
    }));
  }, [geminiResults]);

  const handleFieldChange = (itemId, fieldKey, newValue) => {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      return {
        ...item,
        data: item.data.map(field => 
          field.key === fieldKey ? { ...field, value: newValue, isEdited: true } : field
        )
      };
    }));
  };

  const handleZoomBtn = (itemId, direction) => {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      let newZoom = item.zoom;
      if (direction === 'in') newZoom += 0.2;
      if (direction === 'out') newZoom = Math.max(1, newZoom - 0.2);
      if (direction === 'reset') newZoom = 1;
      return { ...item, zoom: newZoom };
    }));
  };

  const handleWheel = (e, itemId) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      const newZoom = Math.min(Math.max(1, item.zoom + delta * 5), 5);
      return { ...item, zoom: newZoom };
    }));
  };

  const handleMouseDown = (e, ref) => {
    e.preventDefault(); 
    setIsPanning(true); 
    setPanStart({ x: e.clientX, y: e.clientY });
    if (ref.current) setPanOffset({ x: ref.current.scrollLeft, y: ref.current.scrollTop });
  };

  const handleMouseMove = (e, ref) => {
    if (!isPanning || !ref.current) return;
    e.preventDefault();
    const dx = e.clientX - panStart.x;
    const dy = e.clientY - panStart.y;
    ref.current.scrollLeft = panOffset.x - dx;
    ref.current.scrollTop = panOffset.y - dy;
  };

  const handleMouseUp = () => setIsPanning(false);

  // --- API LOGIC: GENERATE REPORT ---
  const handleSaveAll = async () => {
    if (items.some(i => i.isLoading)) return;
    setIsSubmitting(true);

    const flatPayload = {};
    items.forEach(item => {
        item.data.forEach(field => {
            if (field.originalKey) flatPayload[field.originalKey] = field.value;
        });
    });

    try {
        const response = await axios.post(`${API_BASE_URL}/report/${uploadId}`, flatPayload);
        onFinish(response.data.final_description); 
    } catch (error) {
        console.error("Final Report Generation Failed:", error);
        alert("Failed to generate final report. Check console for details.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const allFinished = !items.some(i => i.isLoading);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-600"><ArrowLeft className="w-6 h-6" /></button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Verify Extraction</h1>
            <p className="text-xs text-gray-500">Component: <span className="font-semibold text-indigo-600">{componentName}</span></p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {(isSubmitting || !allFinished) && (
            <div className="text-xs font-medium text-indigo-600 flex items-center bg-indigo-50 px-3 py-1 rounded-full animate-pulse">
              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
              {isSubmitting ? 'Generating Report...' : 'Processing...'}
            </div>
          )}
          <button 
            onClick={handleSaveAll} 
            disabled={!allFinished || isSubmitting} 
            className={`flex items-center px-6 py-2 rounded-lg font-bold shadow-md transition-all ${allFinished && !isSubmitting ? 'bg-green-600 hover:bg-green-700 text-white active:scale-95' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >
            <Save className="w-4 h-4 mr-2" />
            Submit Verified Data
          </button>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 gap-8">
          {items.map((item) => (
            <ImageCard 
              key={item.id} 
              item={item} 
              activeHighlight={activeHighlight} 
              setActiveHighlight={setActiveHighlight} 
              handleFieldChange={handleFieldChange} 
              handleZoomBtn={handleZoomBtn} 
              handleWheel={handleWheel} 
              onPanStart={handleMouseDown} 
              onPanMove={handleMouseMove} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const ImageCard = ({ item, activeHighlight, setActiveHighlight, handleFieldChange, handleZoomBtn, handleWheel, onPanStart, onPanMove }) => {
    const scrollContainerRef = useRef(null);
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row h-[500px]">
            <div className="w-full md:w-5/12 bg-gray-100 border-r border-gray-200 flex flex-col relative">
                <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white z-10">
                    <div className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold shadow-sm">{item.label}</div>
                    <div className="flex items-center space-x-1">
                        <button onClick={() => handleZoomBtn(item.id, 'out')} className="p-1.5 hover:bg-gray-100 rounded text-gray-600"><ZoomOut className="w-4 h-4"/></button>
                        <button onClick={() => handleZoomBtn(item.id, 'reset')} className="p-1.5 hover:bg-gray-100 rounded text-gray-600"><RotateCcw className="w-4 h-4"/></button>
                        <button onClick={() => handleZoomBtn(item.id, 'in')} className="p-1.5 hover:bg-gray-100 rounded text-gray-600"><ZoomIn className="w-4 h-4"/></button>
                    </div>
                </div>
                <div 
                    ref={scrollContainerRef} 
                    className={`flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-100/50 ${item.zoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`} 
                    onWheel={(e) => handleWheel(e, item.id)} 
                    onMouseDown={(e) => onPanStart(e, scrollContainerRef)} 
                    onMouseMove={(e) => onPanMove(e, scrollContainerRef)}
                >
                    <div className="relative transition-transform duration-100 ease-out origin-center select-none" style={{ transform: `scale(${item.zoom})`, minWidth: '100%' }}>
                        <img src={item.croppedImage} alt={item.label} draggable={false} className="w-full h-auto object-contain mix-blend-multiply shadow-sm bg-white" />
                        {activeHighlight && activeHighlight.itemId === item.id && activeHighlight.box.w > 0 && (
                            <div 
                                className="absolute border-2 border-yellow-400 bg-yellow-400/20 shadow-[0_0_15px_rgba(250,204,21,0.6)] z-20 pointer-events-none rounded" 
                                style={{ 
                                    left: `${activeHighlight.box.x}%`, 
                                    top: `${activeHighlight.box.y}%`, 
                                    width: `${activeHighlight.box.w}%`, 
                                    height: `${activeHighlight.box.h}%` 
                                }} 
                            />
                        )}
                    </div>
                </div>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">{item.label} Data</h3>
                        <p className="text-xs text-gray-400">Extracted parameters</p>
                    </div>
                    {!item.isLoading && <span className="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700">Verified</span>}
                </div>
                {item.isLoading ? (
                    <div className="space-y-4 animate-pulse">
                        <div className="flex items-center justify-center pt-4 text-xs text-gray-400">
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />Processing...
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {item.data.length === 0 ? (
                            <div className="text-sm text-gray-400 italic">No data mapped.</div>
                        ) : (
                            item.data.map((field, idx) => (
                                <div key={idx} className="relative group">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 tracking-wide">{field.key}</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={field.value} 
                                            onFocus={() => setActiveHighlight({ itemId: item.id, box: field.box })} 
                                            onChange={(e) => handleFieldChange(item.id, field.key, e.target.value)} 
                                            className={`w-full pl-3 pr-8 py-2.5 rounded-md border text-sm font-medium transition-colors ${field.isEdited ? 'border-indigo-500 bg-indigo-50 text-indigo-900 focus:ring-1 focus:ring-indigo-500' : 'border-gray-300 bg-white text-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'}`} 
                                        />
                                        <Edit3 className={`absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none ${field.isEdited ? 'text-indigo-500' : 'text-gray-400'}`} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerificationPage;