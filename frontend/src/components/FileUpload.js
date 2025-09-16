import React, { useState } from 'react';

const FileUpload = ({ onUpload, loading }) => {
  const [stringsFile, setStringsFile] = useState(null);
  const [classificationsFile, setClassificationsFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!stringsFile || !classificationsFile) {
      alert('Please select both files');
      return;
    }

    const formData = new FormData();
    formData.append('stringsFile', stringsFile);
    formData.append('classificationsFile', classificationsFile);
    
    onUpload(formData);
  };

  return (
    <div className="file-upload-section">
      <h2>Upload CSV Files</h2>
      <form onSubmit={handleSubmit} className="upload-form" data-testid="upload-form">
        <div className="file-input-group">
          <div className="file-input">
            <label htmlFor="strings-file">
              Strings CSV:
              <small>(Tier, Industry, Topic, Subtopic, Prefix, Fuzzing-Idx, Prompt, Risks, Keywords)</small>
            </label>
            <input
              id="strings-file"
              type="file"
              accept=".csv"
              onChange={(e) => setStringsFile(e.target.files[0])}
              disabled={loading}
            />
            {stringsFile && <span className="file-name">{stringsFile.name}</span>}
          </div>

          <div className="file-input">
            <label htmlFor="classifications-file">
              Classifications CSV:
              <small>(Topic, SubTopic, Industry, Classification)</small>
            </label>
            <input
              id="classifications-file"
              type="file"
              accept=".csv"
              onChange={(e) => setClassificationsFile(e.target.files[0])}
              disabled={loading}
            />
            {classificationsFile && <span className="file-name">{classificationsFile.name}</span>}
          </div>
        </div>

        <button type="submit" disabled={loading || !stringsFile || !classificationsFile}>
          {loading ? 'Uploading...' : 'Upload Files'}
        </button>
      </form>
    </div>
  );
};

export default FileUpload;
