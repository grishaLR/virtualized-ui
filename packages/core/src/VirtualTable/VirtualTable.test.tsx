import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VirtualTable } from './VirtualTable';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { useState } from 'react';

interface TestData {
  id: number;
  name: string;
  age: number;
}

const testData: TestData[] = [
  { id: 1, name: 'Alice', age: 30 },
  { id: 2, name: 'Bob', age: 25 },
  { id: 3, name: 'Charlie', age: 35 },
];

const testColumns: ColumnDef<TestData, any>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'age', header: 'Age' },
];

describe('VirtualTable component', () => {
  it('renders table with headers', () => {
    const { container } = render(
      <VirtualTable data={testData} columns={testColumns} height={400} />
    );

    // Check headers render
    expect(screen.getByText('ID')).toBeDefined();
    expect(screen.getByText('Name')).toBeDefined();
    expect(screen.getByText('Age')).toBeDefined();

    // Check ARIA roles
    expect(container.querySelector('[role="grid"]')).not.toBeNull();
    expect(container.querySelectorAll('[role="columnheader"]').length).toBe(3);
  });

  it('sets aria-rowcount on the grid container', () => {
    const { container } = render(
      <VirtualTable data={testData} columns={testColumns} height={400} />
    );

    const grid = container.querySelector('[role="grid"]');
    expect(grid?.getAttribute('aria-rowcount')).toBe('3');
  });

  it('renders with empty data', () => {
    const { container } = render(<VirtualTable data={[]} columns={testColumns} height={400} />);

    const grid = container.querySelector('[role="grid"]');
    expect(grid?.getAttribute('aria-rowcount')).toBe('0');
    // Headers should still render
    expect(screen.getByText('ID')).toBeDefined();
  });

  it('click-to-sort toggles aria-sort', () => {
    function SortableTable() {
      const [sorting, setSorting] = useState<SortingState>([]);
      return (
        <VirtualTable
          data={testData}
          columns={testColumns}
          height={400}
          enableSorting
          sorting={sorting}
          onSortingChange={setSorting}
        />
      );
    }

    render(<SortableTable />);

    // Initially all columns should be aria-sort="none"
    const nameHeader = screen.getByText('Name').closest('[role="columnheader"]');
    expect(nameHeader?.getAttribute('aria-sort')).toBe('none');

    // Click to sort ascending
    fireEvent.click(nameHeader!);
    expect(nameHeader?.getAttribute('aria-sort')).toBe('ascending');

    // Click again for descending
    fireEvent.click(nameHeader!);
    expect(nameHeader?.getAttribute('aria-sort')).toBe('descending');
  });

  it('renders header row with role="row"', () => {
    const { container } = render(
      <VirtualTable data={testData} columns={testColumns} height={400} />
    );

    const headerRow = container.querySelector('thead [role="row"]');
    expect(headerRow).not.toBeNull();
  });

  it('applies className and style', () => {
    const { container } = render(
      <VirtualTable
        data={testData}
        columns={testColumns}
        height={400}
        className="test-class"
        style={{ border: '1px solid red' }}
      />
    );

    const grid = container.querySelector('[role="grid"]');
    expect(grid?.className).toContain('test-class');
  });

  it('sets tabIndex when keyboard navigation enabled', () => {
    const { container } = render(
      <VirtualTable data={testData} columns={testColumns} height={400} enableKeyboardNavigation />
    );

    const grid = container.querySelector('[role="grid"]');
    expect(grid?.getAttribute('tabindex')).toBe('0');
  });

  it('does not set tabIndex when keyboard navigation disabled', () => {
    const { container } = render(
      <VirtualTable data={testData} columns={testColumns} height={400} />
    );

    const grid = container.querySelector('[role="grid"]');
    expect(grid?.getAttribute('tabindex')).toBeNull();
  });
});
