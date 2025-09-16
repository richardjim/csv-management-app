import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import EditableTable from './components/EditableTable';
import ValidationErrors from './components/ValidationErrors';
import { uploadFiles, validateData, exportCSV } from './services/api';
import './App.css';

function App() {
  const [stringsData, setStringsData] = useState([]);
  const [classificationsData, setClassificationsData] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('strings');

  const handleFileUpload = async (files) => {
    setLoading(true);
    try {
      const response = await uploadFiles(files);
      setStringsData(response.stringsData);
      setClassificationsData(response.classificationsData);
      setValidationErrors(response.validationErrors);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload files. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDataUpdate = async (updatedData, dataType) => {
    if (dataType === 'strings') {
      setStringsData(updatedData);
    } else {
      setClassificationsData(updatedData);
    }

    // Validate data after update
    try {
      const response = await validateData(
        dataType === 'strings' ? updatedData : stringsData,
        dataType === 'classifications' ? updatedData : classificationsData
      );
      setValidationErrors(response.valid ? [] : response.errors);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleExport = async (dataType) => {
    try {
      const data = dataType === 'strings' ? stringsData : classificationsData;
      const filename = `${dataType}.csv`;
      await exportCSV(data, filename);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export file. Please try again.');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>CSV Data Management System</h1>
        <p>Upload, edit, validate, and export CSV files</p>
      </header>

      <main className="App-main">
        <FileUpload onUpload={handleFileUpload} loading={loading} />

        {validationErrors.length > 0 && (
          <ValidationErrors errors={validationErrors} />
        )}

        {(stringsData.length > 0 || classificationsData.length > 0) && (
          <div className="data-section">
            <div className="tab-navigation">
              <button
                className={activeTab === 'strings' ? 'active' : ''}
                onClick={() => setActiveTab('strings')}
              >
                Strings Data ({stringsData.length} rows)
              </button>
              <button
                className={activeTab === 'classifications' ? 'active' : ''}
                onClick={() => setActiveTab('classifications')}
              >
                Classifications Data ({classificationsData.length} rows)
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'strings' && stringsData.length > 0 && (
                <div className="table-section">
                  <div className="table-header">
                    <h3>Strings Data</h3>
                    <button 
                      onClick={() => handleExport('strings')}
                      className="export-button"
                    >
                      Export Strings CSV
                    </button>
                  </div>
                  <EditableTable
                    data={stringsData}
                    onUpdate={(updatedData) => handleDataUpdate(updatedData, 'strings')}
                    validationErrors={validationErrors}
                  />
                </div>
              )}

              {activeTab === 'classifications' && classificationsData.length > 0 && (
                <div className="table-section">
                  <div className="table-header">
                    <h3>Classifications Data</h3>
                    <button 
                      onClick={() => handleExport('classifications')}
                      className="export-button"
                    >
                      Export Classifications CSV
                    </button>
                  </div>
                  <EditableTable
                    data={classificationsData}
                    onUpdate={(updatedData) => handleDataUpdate(updatedData, 'classifications')}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;