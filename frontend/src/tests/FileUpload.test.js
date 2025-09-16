import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FileUpload from '../components/FileUpload';

describe('FileUpload Component', () => {
  const mockOnUpload = jest.fn();
  const mockAlert = jest.fn();
  global.alert = mockAlert;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders file inputs and submit button', () => {
    render(<FileUpload onUpload={mockOnUpload} loading={false} />);

    expect(screen.getByText('Upload CSV Files')).toBeInTheDocument();
    expect(screen.getByLabelText(/Strings CSV:/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Classifications CSV:/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upload files/i })).toBeDisabled();
  });

  test('enables submit button when both files are selected and calls onUpload', () => {
    render(<FileUpload onUpload={mockOnUpload} loading={false} />);

    const stringsInput = screen.getByLabelText(/Strings CSV:/);
    const classificationsInput = screen.getByLabelText(/Classifications CSV:/);

    const stringsFile = new File(['strings content'], 'strings.csv', { type: 'text/csv' });
    const classificationsFile = new File(['classifications content'], 'classifications.csv', { type: 'text/csv' });

    fireEvent.change(stringsInput, { target: { files: [stringsFile] } });
    fireEvent.change(classificationsInput, { target: { files: [classificationsFile] } });

    const submitButton = screen.getByRole('button', { name: /upload files/i });
    expect(submitButton).not.toBeDisabled();

    fireEvent.click(submitButton);

    expect(mockOnUpload).toHaveBeenCalledTimes(1);
    const formDataArg = mockOnUpload.mock.calls[0][0];
    expect(formDataArg.get('stringsFile')).toBe(stringsFile);
    expect(formDataArg.get('classificationsFile')).toBe(classificationsFile);
  });

  test('shows alert if trying to submit without both files', () => {
    render(<FileUpload onUpload={mockOnUpload} loading={false} />);

    const form = screen.getByTestId('upload-form');
    fireEvent.submit(form);

    expect(mockAlert).toHaveBeenCalledWith('Please select both files');
    expect(mockOnUpload).not.toHaveBeenCalled();
  });

  test('disables inputs and button when loading is true', () => {
    render(<FileUpload onUpload={mockOnUpload} loading={true} />);

    expect(screen.getByLabelText(/Strings CSV:/)).toBeDisabled();
    expect(screen.getByLabelText(/Classifications CSV:/)).toBeDisabled();

    const submitButton = screen.getByRole('button');
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Uploading...');
  });
});
