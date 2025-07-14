import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import Select from './Select';

const meta = {
  title: 'Forms/Select',
  component: Select,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A customizable select component with validation, accessibility features, and multiple selection support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'The label for the select field',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'The size of the select field',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the select is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether the select is required',
    },
    multiple: {
      control: 'boolean',
      description: 'Enable multiple selection',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
    help: {
      control: 'text',
      description: 'Help text to display',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Whether to take full width',
    },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultOptions = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'disabled', label: 'Disabled Option', disabled: true },
];

const countryOptions = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'au', label: 'Australia' },
  { value: 'fr', label: 'France' },
  { value: 'de', label: 'Germany' },
  { value: 'jp', label: 'Japan' },
];

const priorityOptions = [
  { value: 1, label: 'Low Priority' },
  { value: 2, label: 'Medium Priority' },
  { value: 3, label: 'High Priority' },
  { value: 4, label: 'Critical Priority' },
];

export const Default: Story = {
  args: {
    label: 'Framework',
    options: defaultOptions,
    placeholder: 'Select a framework',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Framework',
    options: defaultOptions,
    value: 'react',
  },
};

export const Required: Story = {
  args: {
    label: 'Framework',
    options: defaultOptions,
    required: true,
    placeholder: 'Select a framework',
    help: 'This field is required',
  },
};

export const WithError: Story = {
  args: {
    label: 'Framework',
    options: defaultOptions,
    error: 'Please select a framework',
    required: true,
  },
};

export const WithHelp: Story = {
  args: {
    label: 'Framework',
    options: defaultOptions,
    help: 'Choose your preferred frontend framework',
    placeholder: 'Select a framework',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Framework',
    options: defaultOptions,
    disabled: true,
    value: 'react',
    help: 'This select is disabled',
  },
};

export const Multiple: Story = {
  args: {
    label: 'Countries',
    options: countryOptions,
    multiple: true,
    help: 'Hold Ctrl/Cmd to select multiple countries',
  },
};

export const SmallSize: Story = {
  args: {
    label: 'Framework',
    options: defaultOptions,
    size: 'sm',
    placeholder: 'Small select',
  },
};

export const LargeSize: Story = {
  args: {
    label: 'Framework',
    options: defaultOptions,
    size: 'lg',
    placeholder: 'Large select',
  },
};

export const NumericValues: Story = {
  args: {
    label: 'Priority',
    options: priorityOptions,
    placeholder: 'Select priority level',
    help: 'Choose the task priority',
  },
};

export const CustomStyling: Story = {
  args: {
    label: 'Framework',
    options: defaultOptions,
    placeholder: 'Custom styled select',
    className: 'border-purple-500 focus:border-purple-600 focus:ring-purple-500',
    containerClassName: 'bg-purple-50 p-4 rounded-lg',
    labelClassName: 'text-purple-700 font-bold',
    help: 'This select has custom styling',
  },
};

// Interactive stories with state
export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState<string | number>('');
    
    return (
      <div className="space-y-4">
        <Select
          {...args}
          value={value}
          onChange={setValue}
        />
        <div className="text-sm text-gray-600">
          Selected value: {value || 'None'}
        </div>
      </div>
    );
  },
  args: {
    label: 'Framework',
    options: defaultOptions,
    placeholder: 'Select a framework',
    help: 'This is a controlled component',
  },
};

export const MultipleControlled: Story = {
  render: (args) => {
    const [values, setValues] = useState<string[]>([]);
    
    return (
      <div className="space-y-4">
        <Select
          {...args}
          multiple
          value={values}
          onChange={(newValues) => setValues(newValues as string[])}
        />
        <div className="text-sm text-gray-600">
          Selected values: {values.length > 0 ? values.join(', ') : 'None'}
        </div>
      </div>
    );
  },
  args: {
    label: 'Countries',
    options: countryOptions,
    help: 'Hold Ctrl/Cmd to select multiple',
  },
};

export const WithValidation: Story = {
  render: (args) => {
    const [value, setValue] = useState<string | number>('');
    const [error, setError] = useState<string>('');
    
    const handleChange = (newValue: string | number | string[]) => {
      setValue(newValue as string | number);
      if (newValue) {
        setError('');
      } else {
        setError('Please select an option');
      }
    };
    
    return (
      <div className="space-y-4">
        <Select
          {...args}
          value={value}
          onChange={handleChange}
          error={error}
        />
        <button
          onClick={() => {
            if (!value) {
              setError('Please select an option');
            }
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Validate
        </button>
      </div>
    );
  },
  args: {
    label: 'Framework',
    options: defaultOptions,
    placeholder: 'Select a framework',
    required: true,
    help: 'Click validate to see error handling',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-6">
      <Select
        label="Small Select"
        options={defaultOptions}
        size="sm"
        placeholder="Small size"
      />
      <Select
        label="Medium Select"
        options={defaultOptions}
        size="md"
        placeholder="Medium size"
      />
      <Select
        label="Large Select"
        options={defaultOptions}
        size="lg"
        placeholder="Large size"
      />
    </div>
  ),
};