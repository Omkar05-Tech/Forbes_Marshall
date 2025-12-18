// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000'; // Ensure this matches your FastAPI port

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadAndProcessImage = async (file, productKey, cropData) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('product_key', productKey);
  formData.append('crop_data_json', JSON.stringify(cropData));

  // 1. Upload
  const uploadResponse = await api.post('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  
  const { upload_id } = uploadResponse.data;

  // 2. Trigger Gemini Processing immediately after upload
  const processResponse = await api.post(`/api/process/${upload_id}`);

  return { 
    uploadId: upload_id, 
    rawResults: processResponse.data.raw_results 
  };
};

export const generateFinalReport = async (uploadId, validatedData) => {
  const response = await api.post(`/api/report/${uploadId}`, validatedData);
  return response.data;
};