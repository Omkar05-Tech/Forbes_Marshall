# backend/mappings/part_definitions.py

"""
Stores the "Physical Image Splitting" logic.
This version contains ONLY the SEAT definition.
"""

PART_DEFINITIONS = {

    # --- SEAT (Matches Frontend Key 'SEAT') ---
    "25NB_300_SEAT": {
        "description_name": "Seat Step",
        "zone_batches": [
            {
                # Corresponds to frontend task id 'cv1' (Profile View)
                "zone_key": "s_cv1", 
                "zone_name": "Seat Step Profile View",
                "questions": {
                    # Major Diameter
                    "major_od": "What is the numeric value of the major outer diameter (marked with d8)?",
                    
                    # Step Turn Dimensions
                    "step_angle": "What is the numeric angle value for the step taper?",
                    "step_od": "What is the numeric diameter value of the smaller step section?",
                    "step_od_tol": "What is the tolerance text shown next to the smaller step diameter?",
                    "step_len": "What is the numeric horizontal length of the smaller step?",
                    "step_len_tol": "What is the tolerance value shown in brackets for the step length?",

                    # Internal Features (Drill & Bore)
                    "drill_angle": "What is the numeric chamfer angle near the internal bore opening?",
                    "bore_id": "What is the numeric inner diameter value marked with H7?",

                    # Total Length - Located at Top Center
                    "total_len": "What is the main length dimension value shown at the very top center?",
                    "total_len_tol_upper": "What is the upper tolerance limit for the top center length?",
                    "total_len_tol_lower": "What is the lower tolerance limit for the top center length?"
                }
            },
            {
                # Corresponds to frontend task id 'cv2' (Table View)
                "zone_key": "s_cv2", 
                "zone_name": "Seat Step Table",
                "questions": {
                    # Tolerance Lookups
                    "d8_upper": "What is the upper limit value for the d8 tolerance?",
                    "d8_lower": "What is the lower limit value for the d8 tolerance?",
                }
            }
        ],

        "final_template": """
--- PROCESS DESCRIPTION ---

### BAR CUTTING
HOLD THE BAR IN MACHINE VICE. CUT THE BAR UPTO 15 MM.
INSPECTION

### FIRST SIDE
HOLD THE BAR IN THREE JAW CHUCK FACE TO CLEAN TURN TO MAINTAIN DIA {major_od}({d8_lower},{d8_upper}) MM WITH {step_angle} DEG STEP TURN TO MAINTAIN DIA {step_od}{step_od_tol}) X {step_len} ({step_len_tol}) MM LENGTH.
C DRILL DRILL 18 MM WITH {drill_angle} DEG BORE TO MAINTAIN DIA {bore_id} H7 MM PART OFF DEBURR AND CLEAN THE JOB
INSPECTION: 100%

### SECOND SIDE
REVERSE HOLD THE JOB IN THREE JAW CHUCK. FACE TO CLEAN.
TURN TO MAINTAIN DIA {major_od}({d8_lower},{d8_upper}) MM
MAINTAIN TOTAL LENGTH {total_len}({total_len_tol_upper},{total_len_tol_lower})
DEBURR AND CLEAN THE JOB
INSPECTION: 100% REMOVE THE JOB

### LASER MARKING
LASER MARKING
"""
    },


    # --- NEW COMPONENT: SLOTTED NUT ---
    "M45_300_SLOTTED_NUT": {
        "description_name": "Slotted Nut M45",
        "zone_batches": [
            {
                # This KEY is important. The frontend must send the crop with this ID.
                "zone_key": "sn_cv1", 
                "zone_name": "Slotted Nut Profile View",
                "questions": {
                    "total_len": "What is the total length dimension value shown at the top of the part? (Output format: Use a dot for the decimal separator)",
                    "thread_spec": "What is the thread specification string starting with M? (Output format: Uppercase 'X' and dot decimal separator)",
                    "chamfer_val": "What is the chamfer dimension text? (Output format: dimension only, exclude the degree symbol)",
                }
            }
        ],
        "final_template": """
--- PROCESS DESCRIPTION ---

### FIRST SIDE
HOLD THE JOB IN THREE JAW CHUCK. FACE TO CLEAN AND MAINTAIN TOTAL LENGTH {total_len} MM. BORE TO MAINTAIN ID.CUT THREAD {thread_spec}MM CHAMFER {chamfer_val}°. CLEAN AND INSPECTION 100%
"""
    },



    "80NB_300_CAGE": {
        "description_name": "Cage 80NB 300",
        "zone_batches": [
            {
                # UNIQUE KEY 1: For the main profile drawing
                "zone_key": "c_cv1", 
                "zone_name": "Cage Profile View",
                "questions": {
                    # Diameters
                    "cage_id": "What is the numeric value of the inner diameter marked with tolerance class H7?",
                    "cage_od_body": "What is the outer diameter value for the middle body section that has a positive tolerance?",
                    "cage_od_body_tol": "What is the tolerance value shown for the outer diameter of the middle body section?",
                    
                    # Vertical Dimensions / Lengths
                    "control_length": "What is the main vertical length dimension shown at the bottom?",
                    "control_length_tol": "What is the tolerance value associated with the main vertical length?",
                    "lip_depth": "What is the small vertical depth dimension that defines the counterbore step?",

                    # "BZ" Dimensions
                    "bz_val_1": "What is the numeric value for the BZ dimension shown on the right side?",
                    "bz_val_2": "What is the numeric value for the BZ dimension shown on the left side?",

                    # Chamfers & Angles
                    "top_chf_len": "What is the linear size value of the chamfer defining the top face?",
                    "top_chf_angle": "What is the angle value of the chamfer defining the top face?",
                    "corner_chf_size": "What is the linear size value that defines the chamfer on the bottom right corner?",
                    "corner_chf_angle": "What is the angle value that defines the chamfer on the bottom right corner?",
                }
            },
            {
                # UNIQUE KEY 2: For the tolerance table
                "zone_key": "c_cv2",
                "zone_name": "Cage Table & Title Block",
                "questions": {
                    # H7 Limits
                    "h7_upper": "What is the upper limit value for the H7 tolerance?",
                    "h7_lower": "What is the lower limit value for the H7 tolerance?", 
                }
            }
        ],

        "final_template": """
--- PROCESS DESCRIPTION ---

### 10 FIRST SIDE
HOLD THE JOB IN SOFT JAW CHUCK.
BORE Ø{cage_id} ({h7_lower},{h7_upper}) CHAMFER {top_chf_len}X{top_chf_angle} DEG.
MAINTAIN BZ {bz_val_1} MM AS SHOWN IN DRG.
DEBURR AND CLEAN.
INSPECTION: 100%

### 20 SECOND SIDE
REVERSE HOLD THE JOB.
MAINTAIN HEIGHT {control_length}({control_length_tol})MM LENGTH MAINTAIN BZ {bz_val_2} MM.
BORE TO MAINTAIN Ø{cage_od_body}({cage_od_body_tol})X{lip_depth} MM DEEP
CHAMFER {corner_chf_size}X{corner_chf_angle} DEG. AS SHOWN IN DRG.
DEBURR AND CLEAN
INSPECTION: 100%
"""
    },


    # --- NEW: EXT TOP COMPONENT ---
    "EXT_TOP": {
        "description_name": "Ext Top Component",
        "zone_batches": [
            # --- ZONE 1: FIRST SIDE ---
            {
                "zone_key": "et_cv1",  
                "zone_name": "First Side Operations",
                "questions": {
                    "step1_dia": "What is the diameter of the very first step (labeled with tolerance f7)?",
                    "step1_len": "What is the length of this first step?",
                    "front_chamfer": "What is the chamfer dimension text at the front of the part?",
                    "step2_dia": "What is the diameter of the second step (located immediately after the first step)?",
                    "step2_len": "What is the length of this second step?", 
                    "step3_dia": "What is the diameter of the third step (labeled with tolerance f8)?",
                    "step3_len": "What is the length of this third step?",
                    "step4_dia": "What is the diameter of the fourth step (labeled with tolerance d9)?",
                    "step4_len": "What is the length of this fourth step?",
                    "step5_dia": "What is the diameter of the fifth step (the last step before the largest flange)?",
                    "step5_len": "What is the length of this fifth step?",
                    "flange_dia": "What is the value of the largest Outer Diameter (OD) on this drawing?",
                    "flange_len": "What is the thickness/length of this largest flange section?",
                    "back_chamfer": "What is the chamfer dimension text on the back face?",
                    "center_drill_dia": "What is the diameter of the center drill hole?",
                    "center_drill_depth": "What is the depth of the center drill hole?",
                    "small_bore_dia": "What is the bore diameter labeled with lowercase 'h7'?",
                    "small_bore_depth": "What is the depth of this small bore?",
                    "detail_relief_dia": "In the detailed view, what is the diameter of the relief cut?",
                    "detail_relief_angle": "In the detailed view, what is the angle value?",
                    "detail_relief_depth": "In the detailed view, what is the depth of the relief?",
                    "detail_radius": "In the detailed view, what is the Radius (R) value?"
                }
            },

            # --- ZONE 2: SECOND SIDE ---
            {
                "zone_key": "et_cv2", # <--- UNIQUE KEY
                "zone_name": "Second Side Operations",
                "questions": {
                    "total_length": "What is the total overall length of the part?",
                    "back_step1_dia": "On this side, what is the diameter of the very first turned step?",
                    "back_step1_len": "What is the length of this first turned step?",
                    "back_step2_dia": "What is the diameter labeled with tolerance 'h9'?",
                    "back_step2_len": "What is the length of the section labeled 'h9'?",
                    "counter_bore_dia": "What is the diameter of the widest counter-bore opening?",
                    "counter_bore_depth": "What is the depth of this counter-bore?",
                    "main_bore_dia": "What is the bore diameter labeled with Capital 'H7'?",
                    "main_bore_depth": "What is the depth of this 'H7' bore?",
                    "ext_thread_spec": "What is the specification for the External Thread (marked with M)?",
                    "ext_thread_len": "What is the length of this external thread?",
                    "int_thread_spec": "What is the specification for the Internal Thread (marked with M)?",
                    "int_thread_len": "What is the length of this internal thread?",
                    "groove_dist": "What is the linear distance to the internal groove?",
                    "groove_spec": "What is the text describing the groove (e.g. standard or size)?",
                }
            },

            # --- ZONE 3: DRILLING ---
            {
                "zone_key": "et_cv3", # <--- UNIQUE KEY
                "zone_name": "Drilling Operations",
                "questions": {
                    "hole_count": "How many holes are in the circular pattern?",
                    "hole_diameter": "What is the diameter of these holes?",
                    "pcd_value": "What is the PCD value?",
                }
            }
        ],

        "final_template": """
Opn Name\tProcess Description
FIRST SIDE\tHOLD THE JOB IN 3 JAW CHUCK.TURN DIA {step1_dia}mm UPTO LENGTH {step1_len}mm CHAMFER {front_chamfer} DEG STEP TURN DIA {step2_dia}mm UPTO LENGTH {step2_len}mm STEP TURN DIA {step3_dia}mm UPTO LENGTH {step3_len}mm STEP TURN DIA {step4_dia}mm UPTO LENGTH {step4_len}mm STEP TURN DIA {step5_dia}mm UPTO LENGTH {step5_len}mm STEP TURN DIA {flange_dia}mm UPTO LENGTH {flange_len}mm AS SHOWN.BACK FACING.CHAMFER {back_chamfer} DEGREE.CENTRE DRILL.DRILL DIA {center_drill_dia}mm UPTO DEPTH {center_drill_depth}mm.BORE DIA {small_bore_dia}mm UPTO DEPTH {small_bore_depth}mm.TURN DIA {detail_relief_dia} WITH MAINTAIN ANGLE {detail_relief_angle} DEG WITH FORMING RADIUS {detail_radius} UPTO DEPTH {detail_relief_depth}mm AS SHOWN IN DETAIL.DEBURR AND CLEAN.INSP- 100%

SECOND SIDE\tREVERSE HOLD THE JOB IN 3 JAW CHUCK.FACE CLEAN TO MAINTAIN {total_length}MM TOTAL LENGTH.TURN DIA {back_step1_dia}MM UPTO LENGTH {back_step1_len}mm.TURN DIA {back_step2_dia} UPTO LENGTH {back_step2_len}mm AS SHOWN.C DRILL DRILL DIA BORE DIA {counter_bore_dia}mm UPTO {counter_bore_depth}mm DEPTH WITH FORM ANGLE 30 DEGREE AT A DEPTH OF {counter_bore_depth}mm AS SHOWN.BORE TO MAINTAIN DIA {main_bore_dia} UPTO DEPTH {main_bore_depth} MM.INTERNAL CHAMFER WITH 30 DEGREE AS SHOWN.CUT EXTERNAL THREADS {ext_thread_spec} FOR {ext_thread_len} MM LENGTH.CUT INTERNAL THREADS {int_thread_spec} FOR {int_thread_len} MM.CUT GROOVE AT LENGTH {groove_dist}mm OF {groove_spec} DEPTH.DEBURR & CLEAN.INSP- 100 %.

DRILLING\tHOLD THE JOB AND DRILL {hole_count} HOLES DIA {hole_diameter} ON PCD {pcd_value}. DEBURR AND CLEAN.INSPECTION 100%
"""
    },



    "ADJ_BOLT": {
        "description_name": "Adjustment Bolt",
        "zone_batches": [
            # --- ZONE 1: PROFILE VIEW ---
            {
                "zone_key": "ab_cv1", # <--- UNIQUE KEY
                "zone_name": "Adjustment Bolt Profile",
                "questions": {
                    "bar_dia": "What is the bar diameter value specified in the 'Drg. No. Thread' block?",
                    "bar_len": "What is the stock bar length specified in the 'Drg. No. Thread' block?",
                    "turn_dia_c9": "What is the major outer diameter value marked with the C9 tolerance?",
                    "turn_len_first_side": "What is the length dimension for the major C9 turning section on the first side?",
                    "chf_size": "What is the linear size value of the main front chamfer?",
                    "chf_angle_1": "What is the angle value of the main front chamfer?",
                    "drill_dia": "What is the drill diameter used for the deep internal bore?",
                    "bore_id_plus": "What is the inner diameter value that has the single-sided positive tolerance (near the center)?",
                    "bore_plus_tol": "What is the single-sided positive tolerance value for the inner diameter (near the center)?",
                    "cb_id_h11": "What is the counterbore inner diameter value marked with H11?",
                    "cb_len": "What is the depth dimension of the counterbore section?",
                    "r_cb": "What is the radius value defining the bottom of the counterbore section?",
                    "groove_width": "What is the width of the main parallel groove section marked with the d9 tolerance?",
                    "groove_start_len": "What is the dimension from the face to the start of the groove marked d9 (the smaller value)?",
                    "groove_end_len": "What is the dimension from the face to the end of the groove marked d9 (the larger value)?",
                    "sw_size": "What is the flat-to-flat size value of the hexagonal milling feature (marked as 'SW')?",
                    "chf_angle_2": "What is the angle degree of the chamfer where the 1x45° note is located?",
                    "tl_overall": "What is the overall length dimension of the part shown near the top?",
                    "turn_od": "What is the major outer diameter value for the second side section (labeled Ø36 in the drawing)?",
                    "drill_thru_dia": "What is the diameter of the drill-through feature?",
                    "groove_od_width": "What is the width of the small groove on the OD that has the 4mm dimension leader?",
                    "bore_id_plus_2": "What is the inner diameter value near the thread root that has the single-sided positive tolerance?",
                    "bore_plus_tol_2": "What is the single-sided positive tolerance value for the inner diameter near the thread root?",
                    "r_bore": "What is the radius value shown at the bottom of the bore with the thread?",
                    "thread_dia": "What is the major diameter value of the internal thread specification?",
                    "thread_pitch": "What is the pitch value of the internal thread specification?",
                    "thread_class": "What is the tolerance class value for the thread specification?",
                    "thread_len": "What is the depth dimension of the internal thread?",
                    "groove_dia_final": "What is the diameter value of the groove near the end face?",
                    "groove_tol_upper": "What is the upper tolerance value for the diameter of the final groove?",
                    "groove_final_width": "What is the width value of the groove near the end face?",
                    "groove_final_width_tol": "What is the single-sided positive tolerance value for the groove width?",
                    "r_groove_final": "What is the radius value associated with the groove near the end face?",
                    "r_groove_final_tol": "What is the tolerance value associated with the radius for the groove near the end face?"
                }
            },
            # --- ZONE 2: TABLE VIEW ---
            {
                "zone_key": "ab_cv2", # <--- UNIQUE KEY
                "zone_name": "Adjustment Bolt Table",
                "questions": {
                    "c9_lower": "What is the lower limit tolerance value listed for the C9 fit?",
                    "c9_upper": "What is the upper limit tolerance value listed for the C9 fit?",
                    "h11_upper": "What is the upper limit tolerance value listed for the H11 fit?",
                    "h11_lower": "What is the lower limit tolerance value listed for the H11 fit?",
                    "d9_lower": "What is the lower limit tolerance value listed for the d9 fit?",
                    "d9_upper": "What is the upper limit tolerance value listed for the d9 fit?",
                    "len_tol_upper": "What is the upper tolerance for the 3-place length dimension?",
                    "len_tol_lower": "What is the lower tolerance for the 3-place length dimension?"
                }
            }
        ],
        "final_template": """### BAR CUTTING
CUT A BAR OF DIA {bar_dia} MM OF LENGTH {bar_len} MM. CHECK AND INSPECT.

### FIRST SIDE
HOLD THE BAR IN THREE JAW CHUCK . FACE TO CLEAN. 
TURN DIAMETER {turn_dia_c9} ({c9_lower}, {c9_upper}) X {turn_len_first_side} MM. 
CHF {chf_size} X {chf_angle_1} DEG. 
CENTER DRILL. DRILL {drill_dia} MM UPTO MAX DEPTH. 
BORE TO MAINTAIN ID {bore_id_plus} (+{bore_plus_tol}) UPTO MAX DEPTH. 
COUNTER BORE TO MAINTAIN ID {cb_id_h11} H11 UPTO {cb_len}MM WITH R{r_cb}. 
GROOVE {groove_width} D9 FROM {groove_start_len} TO {groove_end_len} MM. 
MILL TO MAINTAIN SW{sw_size}. CHF DEGREE {chf_angle_2}. 
DEBURR AND CLEAN INSP : 100 %

### SECOND SIDE
HOLD THE JOB IN THREE JAW CHUCK OF REVERSE SIDE. FACE TO CLEAN AND MAINTAIN {tl_overall} MM TOTAL LENGTH. 
TURN TO MAINTAIN OD {turn_od} MM. 
CENTER DRILL. DRILL THROUGH OF DIA {drill_thru_dia} MM. 
CUT GROOVE ON OD {groove_od_width} MM WIDTH. 
BORE TO MAINTAIN ID {bore_id_plus_2} (+{bore_plus_tol_2}) WITH R {r_bore}. 
CUT THREADS M{thread_dia} X {thread_pitch} {thread_class} LH UPTO {thread_len} MM. 
CUT GROOVE DIA {groove_dia_final} ({groove_tol_upper}) FOR {groove_final_width} (+{groove_final_width_tol}) MM WIDE WITH R {r_groove_final} ({r_groove_final_tol}) MM. 
DEBURR AND CLEAN.INSP : 100 %"""
    },




    "GLAND_NUT": {
        "description_name": "Gland Nut",
        "zone_batches": [
            # --- ZONE 1: LEFT PROFILE ---
            {
                "zone_key": "gn_cv1", # <--- UNIQUE KEY
                "zone_name": "GLAND NUT Left Profile",
                "questions": {
                    "cb_dia_inner_h11": "What is the numeric value of the smallest inner counterbore diameter marked with H11?",
                    "bore_dia_f8": "What is the numeric value of the inner bore diameter marked with F8?",
                    "groove_dia_h8": "What is the numeric value of the groove base diameter marked with H8?",
                    "groove_dia_large_angle": "What is the numeric value of the diameter for the groove that has the large angle?", 
                    "turn_dia_largest_step": "What is the numeric value of the largest parallel turning section?", 
                    "step_dia_e5": "What is the numeric value of the stepped diameter marked with e5?", 
                    
                    "tl_overall": "What is the numeric value of the overall length of the part?",
                    "len_step_inner_cb": "What is the numeric value of the length dimension for the smallest inner counterbore section?", 
                    "len_groove_width_small": "What is the numeric value for the smallest groove width dimension shown near the hex feature?", 
                    "step_depth_e5": "What is the numeric value of the length dimension for the stepped section that extends from the e5 diameter?", 
                    
                    "thread_spec": "What is the full alphanumeric specification of the internal thread?", 
                    "groove_angle_formb": "What is the numeric angle value associated with 'Form B'?", 
                }
            },
            # --- ZONE 2: RIGHT PROFILE ---
            {
                "zone_key": "gn_cv2", # <--- UNIQUE KEY
                "zone_name": "GLAND NUT Right Profile",
                "questions": {
                    "bore_dia_h11_plus": "What is the numeric value of the bore diameter that has the +0.1 tolerance?", 
                    "groove_dia_neg_tol": "What is the numeric value of the groove base diameter that has the -0.1 tolerance?", 
                    
                    "len_cb_mid": "What is the numeric value of the length dimension for the large counterbore section?", 
                    "groove_width_tol_plus": "What is the numeric value of the width for the groove that has the +0.1 tolerance?", 
                    
                    "r_form_bore": "What is the numeric value of the forming radius shown near the large bore?",
                    "groove_width_tol_value": "What is the tolerance value associated with the wide groove width?",
                    "r_thread_bottom": "What is the numeric value of the radius shown at the bottom of the internal thread?",
                }
            },
            # --- ZONE 3: TABLE ---
            {
                "zone_key": "gn_cv3", # <--- UNIQUE KEY
                "zone_name": "GLAND NUT Tolerance Table",
                "questions": {
                    "tol_h11_upper": "What is the upper limit value for the H11 tolerance?",
                    "tol_f8_lower": "What is the lower limit value for the F8 tolerance?",
                    "tol_h8_upper": "What is the upper limit value for the H8 tolerance?",
                    "tol_e5_lower": "What is the lower limit value for the e5 tolerance?",
                    "material_type": "What is the material type listed in the title block?",
                }
            }
        ],

        "final_template": """
--- PROCESS DESCRIPTION ---

### BAR CUTTING
CUT A HEX BAR OF LENGTH AS PER BOM. (LENGTH IS CUT FOR SET OF JOBS TO BE CUT IN PARTING DURING MACHINING)

### FIRST SIDE
HOLD THE BAR IN CHUCK. FACE TO CLEAN. CDRILL. DRILL DIA 10 X 37.5 MM DEEP. 
C BORE TO MAINTAINING DIA {cb_dia_inner_h11}(H11) UPTO {len_step_inner_cb} MM DEEP. 
CBORE DIA {bore_dia_h11_plus}(H11) X {len_cb_mid} MM DEEP FORMING RADIUS {r_form_bore}. 
BORE DIA {bore_dia_f8}(F8) AS SHOWN.
CUT GROOVE DIA {groove_dia_h8}(H8) X {len_groove_width_small}MM WIDTH AT TWO PLACES AS SHOWN.
CUT GROOVE TO FORM DIA {groove_dia_large_angle} WITH R1 FORMING AN ANGLE OF 45 DEG.
PARTING OFF. INSPECTION: 100%

### SECOND SIDE
REVERSE HOLD THE JOB IN CHUCK. FACE CLEAN TO MAINTAIN TL {tl_overall} MM LENGTHS.
TURN TO MAINTAIN DIA {turn_dia_largest_step} X 25.5MM LENGTH.
STEP TURN TO MAINTAIN DIA {step_dia_e5}(e5) X {step_depth_e5} MM DEEP.
CUT GROOVE TO FORM DIA {groove_dia_neg_tol}(-0.1) X {groove_width_tol_plus}({groove_width_tol_value}) MM WIDTH WITH R {r_thread_bottom} FORMING DEPTH.
BORE TO MAINTAIN THREADS TO FORM {thread_spec} MM DEEP. 
REMOVE SHARP EDGES. REMOVE JOB. INSPECTION: 100%
"""
    },




    "PLUG": {
        "description_name": "Parabolic Plug 25NB",
        "zone_batches": [
            # --- ZONE 1: THREAD END (Right Side) ---
            {
                "zone_key": "p_cv1", 
                "zone_name": "Thread End Profile (1st Side)",
                "questions": {
                    "shaft_dia_main": "What is the diameter value of the main long shaft section marked with a lower-case tolerance letter?",
                    "rolling_len_text": "What is the dimension value explicitly labeled with the text 'rolling length'?",
                    "shaft_len_to_undercut": "What is the major horizontal length dimension spanning from the head reference line to the thread undercut?",
                    "undercut_angle": "What is the angle value shown at the thread undercut?",
                    "undercut_radius": "What is the radius value (R) shown at the thread undercut?",
                    "thread_callout": "What is the full thread specification text (starting with M)?",
                    "thread_section_len": "What is the linear length dimension of the threaded section?",
                    "thread_end_chamfer": "What is the chamfer dimension at the very end of the threaded shaft?",
                    "minor_dia_bracket": "What is the reference diameter value shown in parentheses near the thread?",
                }
            },
            
            # --- ZONE 2: PLUG HEAD END (Left Side) ---
            {
                "zone_key": "p_cv2",
                "zone_name": "Plug Head Profile (2nd Side)",
                "questions": {
                    "overall_len": "What is the total overall length dimension of the entire part?",
                    "head_dia": "What is the diameter of the cylindrical head section?",
                    "head_chamfer": "What is the chamfer dimension shown on the head step?",
                    "plug_taper_major_dia": "What is the larger diameter of the tapered plug section?",
                    "plug_taper_angle": "What is the angle value of the plug taper (marked near Detail Z)?",
                    "plug_taper_radius": "What is the radius value (R) shown on the plug taper?",
                    "plug_detail_len": "What is the vertical length dimension shown in the Detail view?",
                    "surface_finish": "What is the surface roughness value (Ra) indicated on the shaft?",
                    "marking_text": "What is the specific text content required for engraving/marking?",
                }
            },

            # --- ZONE 3: TOLERANCE TABLE ---
            {
                "zone_key": "p_cv3",
                "zone_name": "Tolerance Table",
                "questions": {
                    "tol_upper_limit": "In the tolerance table, what is the numeric value listed for the UPPER limit?",
                    "tol_lower_limit": "In the tolerance table, what is the numeric value listed for the LOWER limit?",
                    "tol_standard_ref": "What is the ISO standard number listed for tolerances?",
                }
            }
        ],

        "final_template": """
--- PROCESS DESCRIPTION ---

### BAR CUTTING
CUT THE BAR UPTO LENGTH 235MM. INSPECTION.

### FACEING AND CENTERING
HOLD THE JOB IN 3 JAWS CHUCK. FACE TO CLEAN. CENTERING. DEBURR & CLEAN. INSPECTION.

### 1ST SIDE
HOLD THE JOB IN 3 JAWS CHUCK. PUT TAILSTOCK IN. 
TURN DIA {shaft_dia_main} ({tol_lower_limit},{tol_upper_limit}) X {shaft_len_to_undercut} MM LENGTH. 
TAPER TURN TO MAINTAIN ANGLE OF {undercut_angle} DEG FORMING R{undercut_radius}. 
STEP TURN TO MAINTAIN DIA {minor_dia_bracket} X {thread_section_len} MM LENGTH. 
CHF {thread_end_chamfer} DEG. 
CUT THREADS {thread_callout} UPTO {thread_section_len} MM LENGTH WITH THREAD-ROUGH GREEN MACHINING DIA AS SHOWN. 
DEBURR & CLEAN. INSPECTION.

### 2ND SIDE
REMOVE & REVERSE HOLD THE JOB IN 3 JAWS CHUCK. SECOND SIDE OPERATIONS. 
FACE TO MAINTAIN TOTAL LENGTH {overall_len} MM. 
TURN TO MAINTAIN DIA {head_dia} (Note: Check Process Dia 28). 
CHF {head_chamfer} DEG AT ONE FACES. 
TAPER TURN TO MAINTAIN DIA {plug_taper_major_dia} WITH FORMING AN ANGLE OF {plug_taper_angle} DEG WITH R{plug_taper_radius}. 
AS SHOWN DETAILS IN "Z" STEP TURN TO MAINTAIN DIA {plug_taper_major_dia} UP TO {plug_detail_len} MM. 
REF.DRAWING K10G-196446 FOR PLUGFORM DETAILS. DEBURR & CLEAN. INSPECTION.

### BURNISHING
HOLD THE JOB BETWEEN ROLLERS. ROLLER BURNISH TO MAINTAIN DIA 14 ({tol_lower_limit}, {tol_upper_limit}) x {rolling_len_text} MM LENGTH. INSPECTION 100%

### LASER MARKING
HOLD THE JOB IN FIXTURE. ENGRAVE "{marking_text}" ON PLUG USING LASERMARKING MACHINE.
"""
    },




    "80MM_300_FLANGE_BODY": {
        "description_name": "80mm_300 3-Flange Body",
        "zone_batches": [
            # --- ZONE 1: MAIN BORE ---
            {
                "zone_key": "fb_cv1", # <--- UNIQUE KEY
                "zone_name": "Main Bore View",
                "questions": {
                    "face_from_center_dim": "What is the main centerline dimension from the bore center to the top flange face?",
                    "main_turn_thk": "What is the main thickness of the top flange?",
                    "main_chf_size": "What is the size of the main outer chamfer on the left flange?",
                    "main_chf_angle": "What is the angle of the main outer chamfer on the left flange?",
                    "main_chf_places": "How many places for the main outer chamfer on the left flange?",
                    "main_bore_dia_h7": "What is the diameter for the H7 bore?",
                    "main_bore_dia_b11": "What is the diameter for the B11 bore?",
                    "cb_b11_depth": "What is the depth for the B11 bore?",
                    "bore_dia_95": "What is the diameter of the smallest internal bore at the bottom?",
                    "bore_dia_109": "What is the diameter for the H8 bore?",
                    "cb_109_depth": "What is the depth for the H8 bore?",
                    "cb_110_forming_dia": "What is the diameter of the internal chamfer-forming bore?",
                    "chf_3_angle": "What is the angle of the internal forming chamfer (near 'X')?",
                    "chf_3_size": "What is the size of the internal forming chamfer (near 'X')?",
                    
                    "flange_turn_dia_1": "What is the main flange turning diameter (on the left)?",
                    "flange_step_dia": "What is the step turn diameter (on the left)?",
                    "flange_step_thk": "What is the thickness of the step turn (on the left)?",
                    "flange_chf_angle": "What is the flange chamfer angle (on the left)?",
                    "flange_chf_maint_dia": "What is the maintained diameter for the flange chamfer (on the left)?"
                }
            },
            # --- ZONE 2: SIDE FLANGE (8-Hole) ---
            {
                "zone_key": "fb_cv2", # <--- UNIQUE KEY
                "zone_name": "Side Flange View (8-Hole)",
                "questions": {
                    "flange_2_pcd": "What is the Pitch Circle Diameter (PCD)?",
                    "flange_2_count": "What is the total count of flange holes?",
                    "flange_2_dia": "What is the hole diameter?", 
                    "tap_size": "What is the tap size?",
                    "tap_hole_count": "What is the hole count for the tapped holes?",
                    "side_flange_od": "What is the overall outer diameter of this flange?",
                }
            },
            # --- ZONE 3: TOP FLANGE (4-Hole) ---
            {
                "zone_key": "fb_cv3", # <--- UNIQUE KEY
                "zone_name": "Top Flange View (4-Hole)",
                "questions": {
                    "flange_1_pcd": "What is the Pitch Circle Diameter (PCD)?",
                    "flange_1_count": "What is the total count of flange holes?",
                    "flange_1_dia": "What is the hole diameter?",
                    "top_flange_od": "What is the overall outer diameter?",
                    "chf_2_angle": "What is the angle of the internal chamfer?", 
                    "chf_2_size": "What is the size of the internal chamfer?", 
                }
            },
            # --- ZONE 4: TOLERANCE TABLES ---
            {
                "zone_key": "fb_cv4", # <--- UNIQUE KEY
                "zone_name": "Tolerance Tables",
                "questions": {
                    "face_from_center_tol": "What is the general tolerance for dimensions between 120 and 315mm?",
                    "main_bore_h7_tol": "What is the tolerance for H7?",
                    "main_bore_b11_tol": "What is the tolerance for B11?",
                    "cb_b11_depth_tol": "What is the general tolerance for dimensions up to 6mm?",
                    "bore_95_tol": "What is the general tolerance for dimensions between 30 and 120mm?",
                    "bore_tol_109": "What is the tolerance for the H8 bore?",
                    "cb_109_depth_tol": "What is the general tolerance for dimensions between 6 and 30mm?",
                    "flange_turn_tol_1": "What is the general tolerance for dimensions between 120 and 315mm?",
                }
            }
        ],
        
        "final_template": """
--- FINAL MAPPED DESCRIPTION ---

### MAIN BORE
FACE TO MAINTAIN {face_from_center_dim}({face_from_center_tol}) MM FROM CENTER.
TURN TO MAINTAIN DIA {top_flange_od} X {main_turn_thk} MM THK.
CHF. {main_chf_size}X {main_chf_angle} DEG AT {main_chf_places} PLACES.
TURN TO MAINTAIN {main_turn_thk}MM THK.
BORE TO MAINTAIN DIA {main_bore_dia_h7}({main_bore_h7_tol}) OPEN IN CORE
COUNTER BORE TO MAINTAIN DIA {main_bore_dia_b11}({main_bore_b11_tol}) X {cb_b11_depth}({cb_b11_depth_tol}) MM DEEP.
COUNTER BORE TO MAINTAIN DIA {bore_dia_95}({bore_95_tol}) OPEN TO CORE.
CHF. {chf_2_angle} DEG X{chf_2_size}.
COUNTER BORE TO MAINTAIN DIA {bore_dia_109} ({bore_tol_109}) X{cb_109_depth}({cb_109_depth_tol}) MM DEEP.
COUNTER BORE TO MAINTAIN DIA {cb_110_forming_dia} FORMING CHF. {chf_3_angle} DEGX{chf_3_size}.
REFER DETAIL AS SHOWN IN DRG. C DRILL.
DRILL DIA {flange_1_dia} X {flange_1_count} ON PCD {flange_1_pcd} MM EQUISPACED AND OFF CENTERED.
DRILL DIA {flange_1_dia} X {flange_1_count} ON PCD {flange_1_pcd} MM EQUISPACED AND OFF CENTERED.
C DRILL. DRILL 4 HOLES DIA 22.3 THRU EQUISPACED ON PCD 165 OFF CENTER BY 45DEG. CHF. ALL 4 HOLES.
TAP {tap_size} X {tap_hole_count} HOLES THRU

### FLANGES
HOLD THE JOB IN FIXTURE. FACE TO CLEAN.
TURN TO MAINTAIN {flange_turn_dia_1} ({flange_turn_tol_1}) MM.
STEP TURN TO MAINTAIN {flange_step_dia} X {flange_step_thk} MM THK.
CHF {flange_chf_angle} DEG TO MAINTAIN {flange_chf_maint_dia} DEG.
CUT SERRATIONS AS SHOWN. DEBURR AND CLEAN. INDEX.
FACE TO MAINTAIN {flange_turn_dia_1} ({flange_turn_tol_1}) MM.
STEP TURN TO MAINTAIN {flange_step_dia} X {flange_step_thk} MM THK.
CHF {flange_chf_angle} DEG TO MAINTAIN {flange_chf_maint_dia} DEG.
CUT SERRATIONS AS SHOWN. DEBURR AND CLEAN C DRILL.
DRILL DIA {flange_1_dia} X {flange_1_count} ON PCD {flange_1_pcd} MM EQUISPACED AND OFF CENTERED.
DRILL DIA {flange_1_dia} X {flange_1_count} ON PCD {flange_1_pcd} MM EQUISPACED AND OFF CENTERED.
C DRILL. CHF ALL Holes. INSPECTION 100%

### HYDROTEST
LOAD THE JOB ON MACHINE. CLAMP THE JOB. FIT TOP FLANGE. START TESTING CYCLE & WAIT FOR COMPLETION. REMOVE CLAMP. UNLOAD THE JOB.
"""
    }
}