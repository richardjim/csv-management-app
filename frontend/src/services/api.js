import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const uploadFiles = async (formData) => {
  try {
    const response = await api.post('/csv/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Upload failed');
  }
};

export const validateData = async (stringsData, classificationsData) => {
  try {
    const response = await api.post('/csv/validate', {
      stringsData,
      classificationsData,
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 400) {
      return error.response.data;
    }
    throw new Error(error.response?.data?.message || 'Validation failed');
  }
};

export const exportCSV = async (data, filename) => {
  try {
    const response = await api.post('/csv/export', {
      stringsData: filename.includes('strings') ? data : [],
      classificationsData: filename.includes('classifications') ? data : [],
      filename,
    }, {
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Export failed');
  }
};