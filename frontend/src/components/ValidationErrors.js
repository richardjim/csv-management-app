import React from 'react';

const ValidationErrors = ({ errors }) => {
  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <div className="validation-errors">
      <h3>⚠️ Validation Errors</h3>
      <p>The following errors must be fixed before saving:</p>
      <ul className="error-list">
        {errors.map((error, index) => (
          <li key={index} className="error-item">
            <strong>Row {error.row}:</strong> {error.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ValidationErrors;