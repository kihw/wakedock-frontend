import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Select, { SelectOption } from '../Select';

// Mock the utility functions
jest.mock('@/lib/utils/validation', () => ({
  sanitizeInput: (value: string) => value,
}));

jest.mock('@/lib/utils/accessibility', () => ({
  announceToScreenReader: jest.fn(),
}));

describe('Select Component', () => {
  const mockOptions: SelectOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3', disabled: true },
    { value: 4, label: 'Option 4' },
  ];

  const defaultProps = {
    label: 'Test Select',
    options: mockOptions,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with label and options', () => {
    render(<Select {...defaultProps} />);
    
    expect(screen.getByLabelText('Test Select')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Option 1' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Option 2' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Option 3' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Option 4' })).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<Select {...defaultProps} placeholder="Choose an option" />);
    
    const placeholderOption = screen.getByRole('option', { name: 'Choose an option' });
    expect(placeholderOption).toBeInTheDocument();
    expect(placeholderOption).toHaveAttribute('hidden');
  });

  it('handles single selection', async () => {
    const handleChange = jest.fn();
    render(<Select {...defaultProps} onChange={handleChange} />);
    
    const select = screen.getByLabelText('Test Select');
    await userEvent.selectOptions(select, 'option1');
    
    expect(handleChange).toHaveBeenCalledWith('option1');
  });

  it('handles multiple selection', async () => {
    const handleChange = jest.fn();
    render(<Select {...defaultProps} multiple onChange={handleChange} />);
    
    const select = screen.getByLabelText('Test Select');
    await userEvent.selectOptions(select, ['option1', 'option2']);
    
    expect(handleChange).toHaveBeenCalledWith(['option1', 'option2']);
  });

  it('displays error message', () => {
    render(<Select {...defaultProps} error="This field is required" />);
    
    expect(screen.getByRole('alert')).toHaveTextContent('Error:This field is required');
    expect(screen.getByLabelText('Test Select')).toHaveAttribute('aria-invalid', 'true');
  });

  it('displays help text', () => {
    render(<Select {...defaultProps} help="Please select an option" />);
    
    expect(screen.getByText('Please select an option')).toBeInTheDocument();
  });

  it('handles disabled state', () => {
    render(<Select {...defaultProps} disabled />);
    
    expect(screen.getByLabelText('Test Select')).toBeDisabled();
  });

  it('handles required field', () => {
    render(<Select {...defaultProps} required />);
    
    expect(screen.getByLabelText('Test Select')).toBeRequired();
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('respects disabled options', () => {
    render(<Select {...defaultProps} />);
    
    const disabledOption = screen.getByRole('option', { name: 'Option 3' });
    expect(disabledOption).toBeDisabled();
  });

  it('applies different sizes', () => {
    const { rerender } = render(<Select {...defaultProps} size="sm" />);
    expect(screen.getByLabelText('Test Select')).toHaveClass('px-3', 'py-1.5', 'text-sm');
    
    rerender(<Select {...defaultProps} size="md" />);
    expect(screen.getByLabelText('Test Select')).toHaveClass('px-3', 'py-2', 'text-sm');
    
    rerender(<Select {...defaultProps} size="lg" />);
    expect(screen.getByLabelText('Test Select')).toHaveClass('px-4', 'py-3', 'text-base');
  });

  it('handles controlled component', async () => {
    const ControlledSelect = () => {
      const [value, setValue] = React.useState<string | number>('option2');
      return (
        <Select
          {...defaultProps}
          value={value}
          onChange={(newValue) => setValue(newValue)}
        />
      );
    };
    
    render(<ControlledSelect />);
    
    const select = screen.getByLabelText('Test Select') as HTMLSelectElement;
    expect(select.value).toBe('option2');
    
    await userEvent.selectOptions(select, 'option1');
    expect(select.value).toBe('option1');
  });

  it('handles uncontrolled component', async () => {
    render(<Select {...defaultProps} />);
    
    const select = screen.getByLabelText('Test Select') as HTMLSelectElement;
    expect(select.value).toBe('');
    
    await userEvent.selectOptions(select, 'option1');
    expect(select.value).toBe('option1');
  });

  it('calls onFocus and onBlur handlers', async () => {
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();
    
    render(
      <Select
        {...defaultProps}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    );
    
    const select = screen.getByLabelText('Test Select');
    
    fireEvent.focus(select);
    expect(handleFocus).toHaveBeenCalledTimes(1);
    
    fireEvent.blur(select);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('exposes imperative handle methods', () => {
    const ref = React.createRef<any>();
    render(<Select {...defaultProps} ref={ref} />);
    
    expect(ref.current).toHaveProperty('focus');
    expect(ref.current).toHaveProperty('blur');
    expect(ref.current).toHaveProperty('getValue');
    expect(ref.current).toHaveProperty('setValue');
    
    // Test getValue
    expect(ref.current.getValue()).toBe('');
    
    // Test setValue
    ref.current.setValue('option1');
    expect(ref.current.getValue()).toBe('option1');
  });

  it('applies custom classes', () => {
    render(
      <Select
        {...defaultProps}
        className="custom-select"
        containerClassName="custom-container"
        labelClassName="custom-label"
      />
    );
    
    expect(screen.getByLabelText('Test Select')).toHaveClass('custom-select');
    expect(screen.getByText('Test Select').parentElement).toHaveClass('custom-container');
    expect(screen.getByText('Test Select')).toHaveClass('custom-label');
  });

  it('supports data-testid', () => {
    render(<Select {...defaultProps} data-testid="custom-select" />);
    
    expect(screen.getByTestId('custom-select')).toBeInTheDocument();
  });

  it('handles numeric values', async () => {
    const handleChange = jest.fn();
    render(<Select {...defaultProps} onChange={handleChange} />);
    
    const select = screen.getByLabelText('Test Select');
    await userEvent.selectOptions(select, '4');
    
    expect(handleChange).toHaveBeenCalledWith('4');
  });

  it('applies fullWidth prop', () => {
    const { rerender } = render(<Select {...defaultProps} fullWidth />);
    expect(screen.getByText('Test Select').parentElement).toHaveClass('w-full');
    
    rerender(<Select {...defaultProps} fullWidth={false} />);
    expect(screen.getByText('Test Select').parentElement).not.toHaveClass('w-full');
  });

  it('sets autocomplete attribute', () => {
    render(<Select {...defaultProps} autocomplete="country" />);
    
    expect(screen.getByLabelText('Test Select')).toHaveAttribute('autocomplete', 'country');
  });

  it('sets aria-label attribute', () => {
    render(<Select {...defaultProps} ariaLabel="Country selection" />);
    
    expect(screen.getByLabelText('Test Select')).toHaveAttribute('aria-label', 'Country selection');
  });
});