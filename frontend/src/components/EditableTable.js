import React, { useState, useCallback } from 'react';

const EditableTable = ({ data, onUpdate, validationErrors = [] }) => {
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleCellClick = (rowIndex, field, currentValue) => {
    setEditingCell(`${rowIndex}-${field}`);
    setEditValue(currentValue);
  };

  const handleCellUpdate = (rowIndex, field) => {
    const updatedData = [...data];
    updatedData[rowIndex] = {
      ...updatedData[rowIndex],
      [field]: editValue
    };
    onUpdate(updatedData);
    setEditingCell(null);
    setEditValue('');
  };

  const handleKeyPress = (e, rowIndex, field) => {
    if (e.key === 'Enter') {
      handleCellUpdate(rowIndex, field);
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      setEditValue('');
    }
  };

  const addRow = () => {
    const newRow = {};
    if (data.length > 0) {
      Object.keys(data[0]).forEach(key => {
        newRow[key] = '';
      });
    }
    onUpdate([...data, newRow]);
  };

  const deleteRow = (rowIndex) => {
    if (window.confirm('Are you sure you want to delete this row?')) {
      const updatedData = data.filter((_, index) => index !== rowIndex);
      onUpdate(updatedData);
    }
  };

  const isRowInvalid = (rowIndex) => {
    return validationErrors.some(error => error.row === rowIndex + 1);
  };

  const getRowErrors = (rowIndex) => {
    return validationErrors.filter(error => error.row === rowIndex + 1);
  };

  if (!data || data.length === 0) {
    return <div className="no-data">No data available</div>;
  }

  const columns = Object.keys(data[0]);

  return (
    <div className="editable-table-container">
      <div className="table-controls">
        <button onClick={addRow} className="add-row-button">
          Add Row
        </button>
      </div>
      
      <div className="table-wrapper">
        <table className="editable-table">
          <thead>
            <tr>
              <th>#</th>
              {columns.map(column => (
                <th key={column}>{column}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => {
              const rowErrors = getRowErrors(rowIndex);
              const hasErrors = isRowInvalid(rowIndex);
              
              return (
                <React.Fragment key={rowIndex}>
                  <tr className={hasErrors ? 'invalid-row' : ''}>
                    <td className="row-number">{rowIndex + 1}</td>
                    {columns.map(column => {
                      const cellKey = `${rowIndex}-${column}`;
                      const isEditing = editingCell === cellKey;
                      
                      return (
                        <td key={column} className="editable-cell">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => handleCellUpdate(rowIndex, column)}
                              onKeyDown={(e) => handleKeyPress(e, rowIndex, column)}
                              autoFocus
                              className="cell-input"
                            />
                          ) : (
                            <div
                              onClick={() => handleCellClick(rowIndex, column, row[column] || '')}
                              className="cell-content"
                              title="Click to edit"
                            >
                              {row[column] || <span className="empty-cell">Empty</span>}
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td>
                      <button
                        onClick={() => deleteRow(rowIndex)}
                        className="delete-button"
                        title="Delete row"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  {hasErrors && (
                    <tr className="error-row">
                      <td colSpan={columns.length + 2}>
                        <div className="row-errors">
                          {rowErrors.map((error, errorIndex) => (
                            <div key={errorIndex} className="error-message">
                              {error.message}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EditableTable;