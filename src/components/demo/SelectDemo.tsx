import React, { useState } from 'react';
import Select, { SelectOption } from '../forms/Select';

const SelectDemo: React.FC = () => {
  // State for controlled components
  const [singleValue, setSingleValue] = useState<string | number>('');
  const [multipleValue, setMultipleValue] = useState<string[]>([]);
  const [withError, setWithError] = useState<string>('');
  
  // Sample options
  const countryOptions: SelectOption[] = [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'au', label: 'Australia' },
    { value: 'fr', label: 'France' },
    { value: 'de', label: 'Germany' },
    { value: 'jp', label: 'Japan' },
    { value: 'disabled', label: 'Disabled Option', disabled: true },
  ];
  
  const sizeOptions: SelectOption[] = [
    { value: 'xs', label: 'Extra Small' },
    { value: 'sm', label: 'Small' },
    { value: 'md', label: 'Medium' },
    { value: 'lg', label: 'Large' },
    { value: 'xl', label: 'Extra Large' },
  ];
  
  const priorityOptions: SelectOption[] = [
    { value: 1, label: 'Low Priority' },
    { value: 2, label: 'Medium Priority' },
    { value: 3, label: 'High Priority' },
    { value: 4, label: 'Critical' },
  ];
  
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold mb-6">Select Component Demo</h1>
      
      {/* Basic Select */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Basic Select</h2>
        <Select
          label="Country"
          options={countryOptions}
          placeholder="Select a country"
          help="Choose your country of residence"
          value={singleValue}
          onChange={(value) => setSingleValue(value)}
        />
        <p className="text-sm text-gray-600">
          Selected value: {singleValue || 'None'}
        </p>
      </div>
      
      {/* Required Select */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Required Select</h2>
        <Select
          label="Size"
          options={sizeOptions}
          placeholder="Select a size"
          required
          help="This field is required"
        />
      </div>
      
      {/* Select with Error */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Select with Error</h2>
        <Select
          label="Priority Level"
          options={priorityOptions}
          value={withError}
          onChange={(value) => setWithError(value as string)}
          error={!withError ? "Please select a priority level" : ""}
          required
        />
      </div>
      
      {/* Multiple Select */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Multiple Select</h2>
        <Select
          label="Preferred Countries"
          options={countryOptions}
          multiple
          help="Hold Ctrl/Cmd to select multiple options"
          value={multipleValue}
          onChange={(value) => setMultipleValue(value as string[])}
        />
        <p className="text-sm text-gray-600">
          Selected values: {multipleValue.length > 0 ? multipleValue.join(', ') : 'None'}
        </p>
      </div>
      
      {/* Different Sizes */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Different Sizes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Small Select"
            options={sizeOptions}
            size="sm"
            placeholder="Small size"
          />
          <Select
            label="Medium Select"
            options={sizeOptions}
            size="md"
            placeholder="Medium size"
          />
          <Select
            label="Large Select"
            options={sizeOptions}
            size="lg"
            placeholder="Large size"
          />
        </div>
      </div>
      
      {/* Disabled Select */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Disabled Select</h2>
        <Select
          label="Disabled Field"
          options={countryOptions}
          disabled
          value="us"
          help="This field is disabled"
        />
      </div>
      
      {/* Custom Styling */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Custom Styling</h2>
        <Select
          label="Custom Styled Select"
          options={priorityOptions}
          placeholder="Choose priority"
          className="border-purple-500 focus:border-purple-600 focus:ring-purple-500"
          containerClassName="bg-purple-50 p-4 rounded-lg"
          labelClassName="text-purple-700 font-bold"
          help="This select has custom styling applied"
        />
      </div>
    </div>
  );
};

export default SelectDemo;