import { useState, useCallback, useRef } from 'react';
import { uploadFiles, validateData, exportCSV } from '../services/api';

export const useCSVData = () => {
  const [stringsData, setStringsData] = useState([]);
  const [classificationsData, setClassificationsData] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  // Keep track of original data for reset functionality
  const originalDataRef = useRef({ strings: [], classifications: [] });

  const handleFileUpload = useCallback(async (files) => {
    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const response = await uploadFiles(files, (progress) => {
        setUploadProgress(progress);
      });

      setStringsData(response.stringsData);
      setClassificationsData(response.classificationsData);
      setValidationErrors(response.validationErrors);

      // Store original data for reset functionality
      originalDataRef.current = {
        strings: [...response.stringsData],
        classifications: [...response.classificationsData]
      };

      setUploadProgress(100);
    } catch (error) {
      setError(error.message);
      console.error('Upload failed:', error);
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, []);

  const handleDataUpdate = useCallback(async (updatedData, dataType) => {
    try {
      if (dataType === 'strings') {
        setStringsData(updatedData);
      } else {
        setClassificationsData(updatedData);
      }

      // Validate data after update
      const response = await validateData(
        dataType === 'strings' ? updatedData : stringsData,
        dataType === 'classifications' ? updatedData : classificationsData
      );
      
      setValidationErrors(response.valid ? [] : response.errors);
    } catch (error) {
      setError(error.message);
      console.error('Validation failed:', error);
    }
  }, [stringsData, classificationsData]);

  const handleExport = useCallback(async (dataType) => {
    try {
      setLoading(true);
      const data = dataType === 'strings' ? stringsData : classificationsData;
      const filename = `${dataType}.csv`;
      await exportCSV(data, filename);
    } catch (error) {
      setError(error.message);
      console.error('Export failed:', error);
    } finally {
      setLoading(false);
    }
  }, [stringsData, classificationsData]);

  const addRow = useCallback((dataType) => {
    const currentData = dataType === 'strings' ? stringsData : classificationsData;
    
    if (currentData.length === 0) return;

    // Create new row with empty values based on existing columns
    const newRow = {};
    Object.keys(currentData[0]).forEach(key => {
      newRow[key] = '';
    });

    const updatedData = [...currentData, newRow];
    handleDataUpdate(updatedData, dataType);
  }, [stringsData, classificationsData, handleDataUpdate]);

  const deleteRow = useCallback((dataType, rowIndex) => {
    const currentData = dataType === 'strings' ? stringsData : classificationsData;
    const updatedData = currentData.filter((_, index) => index !== rowIndex);
    handleDataUpdate(updatedData, dataType);
  }, [stringsData, classificationsData, handleDataUpdate]);

  const resetData = useCallback(() => {
    setStringsData([...originalDataRef.current.strings]);
    setClassificationsData([...originalDataRef.current.classifications]);
    setValidationErrors([]);
    setError(null);
  }, []);

  const clearData = useCallback(() => {
    setStringsData([]);
    setClassificationsData([]);
    setValidationErrors([]);
    setError(null);
    originalDataRef.current = { strings: [], classifications: [] };
  }, []);

  const getDataStats = useCallback(() => {
    return {
      stringsRowCount: stringsData.length,
      classificationsRowCount: classificationsData.length,
      errorCount: validationErrors.length,
      hasData: stringsData.length > 0 || classificationsData.length > 0,
      isValid: validationErrors.length === 0
    };
  }, [stringsData, classificationsData, validationErrors]);

  return {
    // Data state
    stringsData,
    classificationsData,
    validationErrors,
    loading,
    uploadProgress,
    error,

    // Actions
    handleFileUpload,
    handleDataUpdate,
    handleExport,
    addRow,
    deleteRow,
    resetData,
    clearData,

    // Utilities
    getDataStats,
    
    // Direct setters for advanced use cases
    setStringsData,
    setClassificationsData,
    setValidationErrors,
    setError
  };
};