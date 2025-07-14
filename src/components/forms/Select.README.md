# Select Component Migration Guide

This document explains the migration from the Svelte Select component to the React/TypeScript Select component.

## Migration Overview

The Select component has been migrated from `/src/lib/components/ui/molecules/Select.svelte` to `/src/components/forms/Select.tsx`.

### Key Changes

1. **Framework**: Migrated from Svelte to React with TypeScript
2. **Event Handling**: Changed from Svelte's event dispatching to React's callback props
3. **State Management**: Uses React hooks instead of Svelte's reactive declarations
4. **Styling**: Uses Tailwind CSS classes with `clsx` for conditional styling
5. **Accessibility**: Maintains all ARIA attributes and screen reader announcements

## Usage

### Basic Usage

```tsx
import { Select } from '@/components/forms';

function MyComponent() {
  const [value, setValue] = useState('');
  
  const options = [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' }
  ];
  
  return (
    <Select
      label="Country"
      options={options}
      value={value}
      onChange={setValue}
      placeholder="Select a country"
    />
  );
}
```

### With Validation

```tsx
<Select
  label="Priority"
  options={priorityOptions}
  value={priority}
  onChange={setPriority}
  required
  error={!priority ? "Please select a priority" : ""}
  help="Choose the task priority level"
/>
```

### Multiple Selection

```tsx
const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

<Select
  label="Countries"
  options={countryOptions}
  multiple
  value={selectedCountries}
  onChange={setSelectedCountries}
  help="Hold Ctrl/Cmd to select multiple"
/>
```

### Different Sizes

```tsx
<Select
  label="Size"
  options={sizeOptions}
  size="sm" // 'sm' | 'md' | 'lg'
/>
```

### Using with FormField

The Select component is also integrated with the FormField component:

```tsx
<FormField
  type="select"
  label="Country"
  name="country"
  options={countryOptions}
  required
  validationRules={[
    { rule: (value) => !!value, message: 'Country is required' }
  ]}
/>
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | string | - | Required. The label for the select field |
| options | SelectOption[] | [] | Array of options with value, label, and optional disabled |
| value | string \| number \| string[] | - | Controlled component value |
| onChange | (value) => void | - | Change handler |
| required | boolean | false | Whether the field is required |
| disabled | boolean | false | Whether the field is disabled |
| multiple | boolean | false | Enable multiple selection |
| error | string | '' | Error message to display |
| help | string | '' | Help text to display |
| size | 'sm' \| 'md' \| 'lg' | 'md' | Field size |
| placeholder | string | '' | Placeholder text |
| fullWidth | boolean | true | Whether to take full width |
| className | string | - | Custom CSS classes for select element |
| containerClassName | string | - | Custom CSS classes for container |
| labelClassName | string | - | Custom CSS classes for label |

## Accessibility Features

- Proper ARIA labels and descriptions
- Screen reader announcements for selections
- Keyboard navigation support
- Error state announcements
- Required field indicators

## Testing

The component includes comprehensive tests. Run them with:

```bash
npm test src/components/forms/__tests__/Select.test.tsx
```

## Migration Steps

1. Replace imports:
   ```tsx
   // Old (Svelte)
   import Select from '$lib/components/ui/molecules/Select.svelte';
   
   // New (React)
   import { Select } from '@/components/forms';
   ```

2. Update event handling:
   ```tsx
   // Old (Svelte)
   <Select on:change={(e) => handleChange(e.detail.value)} />
   
   // New (React)
   <Select onChange={(value) => handleChange(value)} />
   ```

3. Update state management:
   ```tsx
   // Old (Svelte)
   let value = '';
   
   // New (React)
   const [value, setValue] = useState('');
   ```

## Notes

- The React version maintains all the security features (input sanitization)
- Accessibility features are preserved with screen reader announcements
- The component supports both controlled and uncontrolled modes
- Custom styling can be applied through className props
- The component is fully typed with TypeScript