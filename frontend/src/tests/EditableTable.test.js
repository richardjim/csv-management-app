import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditableTable from '../components/EditableTable';

Object.defineProperty(window, 'confirm', {
  writable: true,
  value: jest.fn(),
});

describe('EditableTable Component', () => {
  const mockOnUpdate = jest.fn();
  const sampleData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  ];

  const sampleValidationErrors = [
    { row: 1, message: 'Name is required' },
    { row: 1, message: 'Email format is invalid' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    window.confirm.mockReturnValue(true);
  });

  const renderEditableTable = (props = {}) => {
    const defaultProps = {
      data: sampleData,
      onUpdate: mockOnUpdate,
      validationErrors: [],
      ...props,
    };
    return render(<EditableTable {...defaultProps} />);
  };

  describe('Basic Rendering', () => {
    test('renders component without crashing', () => {
      renderEditableTable();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    test('renders headers correctly', () => {
      renderEditableTable();
      expect(screen.getByText('id')).toBeInTheDocument();
      expect(screen.getByText('name')).toBeInTheDocument();
      expect(screen.getByText('email')).toBeInTheDocument();
      expect(screen.getByText('role')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    test('renders data rows', () => {
      renderEditableTable();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    test('renders row numbers', () => {
      renderEditableTable();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    test('renders Add Row button', () => {
      renderEditableTable();
      expect(screen.getByRole('button', { name: /add row/i })).toBeInTheDocument();
    });

    test('renders delete buttons', () => {
      renderEditableTable();
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      expect(deleteButtons).toHaveLength(2);
    });
  });

  describe('Empty Data', () => {
    test('shows no data message when data is empty', () => {
      renderEditableTable({ data: [] });
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    test('shows no data message when data is null', () => {
      renderEditableTable({ data: null });
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    test('shows no data message when data is undefined', () => {
      renderEditableTable({ data: undefined });
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });
  });

  describe('Cell Editing', () => {
    test('enters edit mode when cell is clicked', () => {
      renderEditableTable();
      const nameCell = screen.getByText('John Doe');
      fireEvent.click(nameCell);
      
      const input = screen.getByDisplayValue('John Doe');
      expect(input).toBeInTheDocument();
      expect(input).toHaveFocus();
    });

    test('saves changes on blur', () => {
      renderEditableTable();
      const nameCell = screen.getByText('John Doe');
      fireEvent.click(nameCell);
      
      const input = screen.getByDisplayValue('John Doe');
      fireEvent.change(input, { target: { value: 'John Updated' } });
      fireEvent.blur(input);
      
      expect(mockOnUpdate).toHaveBeenCalledWith([
        { id: 1, name: 'John Updated', email: 'john@example.com', role: 'Admin' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
      ]);
    });

    test('saves changes on Enter key', () => {
      renderEditableTable();
      const emailCell = screen.getByText('jane@example.com');
      fireEvent.click(emailCell);
      
      const input = screen.getByDisplayValue('jane@example.com');
      fireEvent.change(input, { target: { value: 'jane.updated@example.com' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
      
      expect(mockOnUpdate).toHaveBeenCalledWith([
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
        { id: 2, name: 'Jane Smith', email: 'jane.updated@example.com', role: 'User' },
      ]);
    });

    test('cancels editing on Escape key', () => {
      renderEditableTable();
      const roleCell = screen.getByText('Admin');
      fireEvent.click(roleCell);
      
      const input = screen.getByDisplayValue('Admin');
      fireEvent.change(input, { target: { value: 'Super Admin' } });
      fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });
      
      expect(mockOnUpdate).not.toHaveBeenCalled();
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    test('handles empty cells', () => {
      const dataWithEmpty = [{ id: 1, name: '', email: 'test@example.com' }];
      renderEditableTable({ data: dataWithEmpty });
      
      const emptyCell = screen.getByText('Empty');
      fireEvent.click(emptyCell);
      
      const input = screen.getByDisplayValue('');
      fireEvent.change(input, { target: { value: 'New Name' } });
      fireEvent.blur(input);
      
      expect(mockOnUpdate).toHaveBeenCalledWith([
        { id: 1, name: 'New Name', email: 'test@example.com' }
      ]);
    });
  });

  describe('Row Management', () => {
    test('adds new row', () => {
      renderEditableTable();
      const addButton = screen.getByRole('button', { name: /add row/i });
      fireEvent.click(addButton);
      
      expect(mockOnUpdate).toHaveBeenCalledWith([
        ...sampleData,
        { id: '', name: '', email: '', role: '' }
      ]);
    });

    test('deletes row when confirmed', () => {
      renderEditableTable();
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      fireEvent.click(deleteButtons[0]);
      
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this row?');
      expect(mockOnUpdate).toHaveBeenCalledWith([
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
      ]);
    });

    test('does not delete row when not confirmed', () => {
      window.confirm.mockReturnValue(false);
      renderEditableTable();
      
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      fireEvent.click(deleteButtons[0]);
      
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this row?');
      expect(mockOnUpdate).not.toHaveBeenCalled();
    });
  });

  describe('Validation Errors', () => {
    test('displays validation errors', () => {
      renderEditableTable({ validationErrors: sampleValidationErrors });
      
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Email format is invalid')).toBeInTheDocument();
    });

    test('applies error styling to invalid rows', () => {
      renderEditableTable({ validationErrors: sampleValidationErrors });
      
      const tableRows = screen.getAllByRole('row');
      expect(tableRows[1]).toHaveClass('invalid-row');
    });

    test('handles empty validation errors', () => {
      renderEditableTable({ validationErrors: [] });
      
      const tableRows = screen.getAllByRole('row');
      tableRows.slice(1).forEach(row => {
        expect(row).not.toHaveClass('invalid-row');
      });
    });

    test('handles undefined validation errors', () => {
      renderEditableTable({ validationErrors: undefined });
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles single row data', () => {
      const singleRowData = [{ name: 'Single Row', value: 'Test' }];
      renderEditableTable({ data: singleRowData });
      
      expect(screen.getByText('Single Row')).toBeInTheDocument();
      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    test('handles data with mixed column structures', () => {
      const mixedData = [
        { name: 'John', age: 30 },
        { name: 'Jane', email: 'jane@example.com' },
      ];
      
      renderEditableTable({ data: mixedData });
      
      expect(screen.getByText('name')).toBeInTheDocument();
      expect(screen.getByText('age')).toBeInTheDocument();
      expect(screen.getByText('John')).toBeInTheDocument();
    });

    test('handles empty object data', () => {
      const emptyObjectData = [{}];
      renderEditableTable({ data: emptyObjectData });
      
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper button titles', () => {
      renderEditableTable();
      
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      deleteButtons.forEach(button => {
        expect(button).toHaveAttribute('title', 'Delete row');
      });
    });

    test('cells have edit hint titles', () => {
      renderEditableTable();
      
      const cellContents = document.querySelectorAll('.cell-content');
      cellContents.forEach(cell => {
        expect(cell).toHaveAttribute('title', 'Click to edit');
      });
    });
  });

  describe('Keyboard Navigation', () => {
    test('supports Enter key for saving', () => {
      renderEditableTable();
      const nameCell = screen.getByText('John Doe');
      fireEvent.click(nameCell);
      
      const input = screen.getByDisplayValue('John Doe');
      fireEvent.change(input, { target: { value: 'John Enter' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
      
      expect(mockOnUpdate).toHaveBeenCalled();
    });

    test('supports Escape key for canceling', () => {
      renderEditableTable();
      const nameCell = screen.getByText('John Doe');
      fireEvent.click(nameCell);
      
      const input = screen.getByDisplayValue('John Doe');
      fireEvent.change(input, { target: { value: 'John Escape' } });
      fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });
      
      expect(mockOnUpdate).not.toHaveBeenCalled();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    test('ignores other keys', () => {
      renderEditableTable();
      const nameCell = screen.getByText('John Doe');
      fireEvent.click(nameCell);
      
      const input = screen.getByDisplayValue('John Doe');
      fireEvent.keyDown(input, { key: 'Tab', code: 'Tab' });
      
      expect(input).toBeInTheDocument();
      expect(mockOnUpdate).not.toHaveBeenCalled();
    });
  });
});