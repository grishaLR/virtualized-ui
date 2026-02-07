import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VirtualSelect } from './VirtualSelect';

interface TestOption {
  id: string;
  name: string;
}

const testOptions: TestOption[] = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
  { id: '3', name: 'Charlie' },
];

const getOptionValue = (o: TestOption) => o.id;
const getOptionLabel = (o: TestOption) => o.name;

describe('VirtualSelect component', () => {
  it('renders trigger with placeholder', () => {
    render(
      <VirtualSelect
        options={testOptions}
        getOptionValue={getOptionValue}
        getOptionLabel={getOptionLabel}
        placeholder="Select..."
      />
    );

    expect(screen.getByText('Select...')).toBeDefined();
  });

  it('renders multi-select tags in the trigger', () => {
    render(
      <VirtualSelect
        options={testOptions}
        getOptionValue={getOptionValue}
        getOptionLabel={getOptionLabel}
        multiple
        defaultValue={['1', '2']}
      />
    );

    // Tags are rendered in the trigger area, not in the virtualised menu
    expect(screen.getByText('Alice')).toBeDefined();
    expect(screen.getByText('Bob')).toBeDefined();
  });

  it('renders clear indicator when selection exists', () => {
    render(
      <VirtualSelect
        options={testOptions}
        getOptionValue={getOptionValue}
        getOptionLabel={getOptionLabel}
        defaultValue={['1']}
      />
    );

    const clearButton = screen.getByLabelText('Clear selection');
    expect(clearButton).toBeDefined();
  });

  it('renders dropdown indicator', () => {
    render(
      <VirtualSelect
        options={testOptions}
        getOptionValue={getOptionValue}
        getOptionLabel={getOptionLabel}
      />
    );

    expect(screen.getByText('▼')).toBeDefined();
  });

  it('opens menu container on trigger click', () => {
    const { container } = render(
      <VirtualSelect
        options={testOptions}
        getOptionValue={getOptionValue}
        getOptionLabel={getOptionLabel}
        placeholder="Select..."
      />
    );

    // Menu should not exist before click
    expect(container.querySelector('[data-part="menu"]')).toBeNull();

    const trigger = screen.getByText('Select...');
    fireEvent.click(trigger);

    // Menu container should now be rendered
    expect(container.querySelector('[data-part="menu"]')).not.toBeNull();
  });

  it('does not render clear indicator when no selection', () => {
    render(
      <VirtualSelect
        options={testOptions}
        getOptionValue={getOptionValue}
        getOptionLabel={getOptionLabel}
        placeholder="Select..."
      />
    );

    expect(screen.queryByLabelText('Clear selection')).toBeNull();
  });
});
