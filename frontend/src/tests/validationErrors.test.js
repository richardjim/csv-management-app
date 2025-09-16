import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ValidationErrors from '../components/ValidationErrors';

describe('ValidationErrors Component', () => {
  const mockErrors = [
    { row: 1, message: 'Invalid data in row 1' },
    { row: 3, message: 'Missing required field in row 3' }
  ];

  it('renders validation errors correctly', () => {
    render(<ValidationErrors errors={mockErrors} />);
    
    expect(screen.getByText('Validation Errors')).toBeInTheDocument();
    expect(screen.getByText('The following errors must be fixed before saving:')).toBeInTheDocument();
    expect(screen.getByText('Invalid data in row 1')).toBeInTheDocument();
    expect(screen.getByText('Missing required field in row 3')).toBeInTheDocument();
  });

  it('does not render when no errors', () => {
    const { container } = render(<ValidationErrors errors={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('does not render when errors is null/undefined', () => {
    const { container } = render(<ValidationErrors errors={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders row numbers correctly', () => {
    render(<ValidationErrors errors={mockErrors} />);
    
    expect(screen.getByText('Row 1:')).toBeInTheDocument();
    expect(screen.getByText('Row 3:')).toBeInTheDocument();
  });
});

