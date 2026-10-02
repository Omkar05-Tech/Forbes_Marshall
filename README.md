# Forbes Marshall Drawing Mapper

## Video Link :-
https://drive.google.com/file/d/1Ij2tQ4XiUbgAI3_NfhYkkrd6XHlrq58T/view?usp=drive_link

## Industry Project Overview

The Forbes Marshall Drawing Mapper is an AI-powered web application designed to revolutionize manufacturing processes by automating the extraction of critical engineering specifications from technical drawings. This system leverages Google Gemini AI to intelligently parse complex mechanical drawings and generate precise manufacturing instructions, significantly reducing manual interpretation time and human error in production workflows.

## 🎯 Problem Statement

In traditional manufacturing environments, engineers must manually interpret technical drawings to extract dimensions, tolerances, and specifications before creating manufacturing instructions. This process is:
- Time-consuming and labor-intensive
- Prone to human error in dimension extraction
- Inconsistent across different operators
- Bottleneck in production planning

## 🚀 Solution

Our application provides an end-to-end solution that:
- Accepts PDF or image uploads of engineering drawings
- Allows users to define specific regions of interest through an intuitive cropping interface
- Uses advanced AI (Google Gemini) to extract precise dimensional data
- Generates standardized manufacturing process descriptions
- Maintains data persistence for audit trails and process optimization

## 🏗️ Low-Level Design & Architecture

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │  FastAPI Backend │    │   MongoDB       │
│   (Port 5173)   │◄──►│   (Port 8000)    │◄──►│   Database      │
│                 │    │                  │    │                 │
│ • Image Upload  │    │ • File Processing│    │ • Document      │
│ • Crop Interface│    │ • AI Integration │    │   Storage       │
│ • Data Verification│  │ • Process Gen    │    │ • Audit Trail   │
│ • Results Display│    │ • API Endpoints  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

#### Frontend
- **Framework**: React 19.2.0 with Vite
- **Styling**: Tailwind CSS 4.1.17
- **HTTP Client**: Axios 1.13.2
- **UI Components**: Lucide React icons
- **PDF Processing**: PDF.js 5.4.449
- **Build Tool**: Vite 7.2.4

#### Backend
- **Framework**: FastAPI with automatic API documentation
- **Database**: MongoDB with Motor (async driver)
- **AI Integration**: Google Generative AI (Gemini)
- **Image Processing**: Pillow (PIL)
- **PDF Processing**: PyMuPDF (Fitz)
- **ASGI Server**: Uvicorn
- **Data Validation**: Pydantic

#### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Deployment**: Render.com (cloud platform)
- **Environment Management**: python-dotenv

### Component Architecture

#### Frontend Components

```
App.jsx (Main Router)
├── WorkspacePage.jsx
│   ├── Image Upload & Preview
│   ├── Component Type Selection
│   ├── Crop Task Management
│   └── ImageCropper.jsx (Canvas-based cropping)
│
├── VerificationPage.jsx
│   ├── Gemini Results Display
│   ├── Manual Data Correction
│   ├── Validation Interface
│   └── API Integration
│
└── DescriptionPage.jsx
    └── Final Process Description Display
```

#### Backend Architecture

```
main.py (FastAPI Application)
├── config.py (Environment Configuration)
├── database/
│   └── mongo.py (Database Operations)
├── mappings/
│   └── part_definitions.py (Component Specifications)
├── services/
│   ├── gemini_caller.py (AI Integration)
│   └── image_handler.py (Image Processing)
└── API Endpoints:
    ├── POST /api/upload (File Processing)
    ├── POST /api/process/{upload_id} (AI Processing)
    ├── POST /api/report/{upload_id} (Report Generation)
    └── GET /api/view-image/{upload_id} (Image Retrieval)
```

### Data Flow Architecture

```
1. User Upload Phase
   User → Frontend → File Upload → Backend → MongoDB Storage
   ↓
2. Processing Phase
   Image → Crop Regions → Base64 Encoding → AI Processing
   ↓
3. AI Extraction Phase
   Cropped Images → Gemini API → Structured Data → Validation
   ↓
4. Report Generation Phase
   Validated Data → Template Mapping → Process Description → Storage
   ↓
5. Output Phase
   Generated Report → Frontend Display → User Review
```

### Database Schema

#### Document Structure
```javascript
{
  "_id": ObjectId,
  "upload_id": "uuid-string",
  "product_key": "25NB_300_SEAT",
  "original_filename": "drawing.pdf",
  "full_image_b64": "base64-encoded-image",
  "cropped_images_b64": {
    "s_cv1": "base64-cropped-image-1",
    "s_cv2": "base64-cropped-image-2"
  },
  "status": "completed|error|validation_pending",
  "gemini_raw_results": {...},
  "final_validated_data": {...},
  "final_description": "Generated process description",
  "created_at": ISODate,
  "updated_at": ISODate
}
```

### Supported Component Types

The system currently supports 8 different mechanical component types:

1. **25NB_300_SEAT** - Valve seat component
2. **M45_300_SLOTTED_NUT** - Slotted nut with threading
3. **80NB_300_CAGE** - Cage component with multiple views
4. **EXT_TOP** - Extended top component with complex operations
5. **ADJ_BOLT** - Adjustment bolt with multiple machining steps
6. **GLAND_NUT** - Gland nut with hex features
7. **PLUG** - Parabolic plug with threading and burnishing
8. **80MM_300_FLANGE_BODY** - Multi-flange body with drilling patterns

### AI Integration Details

#### Gemini API Configuration
- **Model**: Google Gemini Pro Vision
- **Input**: Base64-encoded cropped images + contextual questions
- **Output**: Structured JSON responses with extracted values
- **Error Handling**: Fallback responses for failed extractions

#### Question Engineering
Each component type includes zone-specific questions designed to extract precise dimensional data:

```python
# Example for Seat Component
questions = {
    "major_od": "What is the numeric value of the major outer diameter (marked with d8)?",
    "step_angle": "What is the numeric angle value for the step taper?",
    "total_len": "What is the main length dimension value shown at the very top center?"
}
```

### API Specification

#### Core Endpoints

**POST /api/upload**
- **Purpose**: Process uploaded files and store cropped regions
- **Input**: Multipart form data (file, product_key, crop_data_json)
- **Output**: Upload ID for tracking
- **File Support**: PDF (converted to image) and standard images

**POST /api/process/{upload_id}**
- **Purpose**: Trigger AI processing on cropped images
- **Input**: Upload ID
- **Output**: Raw Gemini extraction results
- **Status Update**: Changes document status to "validation_pending"

**POST /api/report/{upload_id}**
- **Purpose**: Generate final manufacturing report
- **Input**: Upload ID + validated data corrections
- **Output**: Formatted process description
- **Template Engine**: Python string formatting with safe defaults

**GET /api/view-image/{upload_id}**
- **Purpose**: Retrieve stored images for display
- **Output**: Base64-encoded image data

### Image Processing Pipeline

```
Raw Input (PDF/Image)
    ↓
Format Conversion (RGB, PIL Image)
    ↓
Region Cropping (Canvas coordinates)
    ↓
Base64 Encoding (for AI processing)
    ↓
AI Analysis (Gemini Vision)
    ↓
Data Extraction (Structured JSON)
    ↓
Template Application (Manufacturing instructions)
    ↓
Report Generation (Human-readable format)
```

### Deployment Architecture

#### Docker Configuration
- **Multi-service setup**: Frontend, Backend, MongoDB
- **Volume persistence**: MongoDB data persistence
- **Port mapping**: 5173 (frontend), 8000 (backend), 27017 (database)
- **Environment isolation**: Separate .env files per service

#### Render Deployment
- **Service Types**: Web services for frontend/backend
- **Build Context**: Docker-based deployment
- **Environment Variables**: API keys, database URIs
- **Health Checks**: Automatic service monitoring

### Security Considerations

- **API Key Management**: Secure storage of Google Gemini API keys
- **CORS Configuration**: Restricted to frontend origin
- **Input Validation**: File type and size restrictions
- **Data Sanitization**: Safe string formatting to prevent injection
- **Error Handling**: Comprehensive exception management

### Performance Optimization

- **Async Processing**: Non-blocking I/O operations
- **Image Compression**: Efficient storage and transmission
- **Caching Strategy**: MongoDB document caching
- **Batch Processing**: Multiple crop regions processed in parallel
- **Memory Management**: PIL image cleanup and garbage collection

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- Google Gemini API Key
- Node.js 18+ (for local frontend development)
- Python 3.9+ (for local backend development)

### Environment Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd forbes-marshall-drawing-mapper
```

2. **Configure environment variables**
```bash
# Backend/.env
MONGO_URI=mongodb://localhost:27017
GOOGLE_API_KEY=your_gemini_api_key_here
DB_NAME=forbes_marshall_dev
COLLECTION_NAME=product_drawings

# Frontend environment (if needed)
VITE_API_URL=http://localhost:8000
```

3. **Launch with Docker Compose**
```bash
docker-compose up --build
```

4. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Local Development

#### Frontend Development
```bash
cd Frontend
npm install
npm run dev
```

#### Backend Development
```bash
cd Backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## 📊 Usage Workflow

1. **Select Component Type**: Choose from 8 supported mechanical components
2. **Upload Drawing**: Upload PDF or image file of engineering drawing
3. **Define Crop Regions**: Use interactive cropping tool to isolate specific views/tables
4. **AI Processing**: System automatically extracts dimensions using Gemini AI
5. **Data Verification**: Review and correct extracted values if needed
6. **Generate Report**: Receive formatted manufacturing process description

## 🔧 Configuration

### Adding New Component Types

1. **Define specifications** in `Backend/mappings/part_definitions.py`
2. **Configure zones** with specific questions for AI extraction
3. **Create templates** for manufacturing process generation
4. **Update frontend** component templates in `Frontend/src/App.jsx`

### Template Format

Each component uses a template string with placeholders for extracted values:

```python
"final_template": """
### BAR CUTTING
CUT THE BAR UPTO {total_len} MM LENGTH.
INSPECTION

### FIRST SIDE
TURN TO MAINTAIN DIA {major_od}({d8_lower},{d8_upper}) MM
...
"""
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with proper testing
4. Submit a pull request with detailed description

## 📄 License

This project is developed as part of an industry collaboration between educational institutions and Forbes Marshall.

## 📞 Support

For technical support or questions about the system architecture, please contact the development team.

---

**Built with ❤️ for Industry 4.0 Manufacturing Excellence**
