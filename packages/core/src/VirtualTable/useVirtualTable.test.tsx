import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVirtualTable } from './useVirtualTable';
import type { ColumnDef } from '@tanstack/react-table';

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

const testColumnsWithExplicitId: ColumnDef<TestData, any>[] = [
  { id: 'customId', accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
];

describe('useVirtualTable', () => {
  describe('column order derivation', () => {
    it('derives column order from accessorKey', () => {
      const { result } = renderHook(() =>
        useVirtualTable({
          data: testData,
          columns: testColumns,
          enableColumnReordering: true,
        })
      );

      expect(result.current.columnOrder).toEqual(['id', 'name', 'age']);
    });

    it('prefers explicit id over accessorKey', () => {
      const { result } = renderHook(() =>
        useVirtualTable({
          data: testData,
          columns: testColumnsWithExplicitId,
          enableColumnReordering: true,
        })
      );

      expect(result.current.columnOrder).toEqual(['customId', 'name']);
    });
  });

  describe('uncontrolled state', () => {
    it('manages row selection internally', () => {
      const { result } = renderHook(() =>
        useVirtualTable({
          data: testData,
          columns: testColumns,
          enableRowSelection: true,
        })
      );

      expect(result.current.rowSelection).toEqual({});

      act(() => {
        result.current.table.getRow('0').toggleSelected();
      });

      expect(result.current.rowSelection).toEqual({ '0': true });
    });

    it('manages sorting internally', () => {
      const { result } = renderHook(() =>
        useVirtualTable({
          data: testData,
          columns: testColumns,
          enableSorting: true,
        })
      );

      expect(result.current.sorting).toEqual([]);

      act(() => {
        result.current.table.getColumn('name')?.toggleSorting();
      });

      expect(result.current.sorting).toEqual([{ id: 'name', desc: false }]);
    });

    it('manages expanded state internally', () => {
      const { result } = renderHook(() =>
        useVirtualTable({
          data: testData,
          columns: testColumns,
          enableRowExpansion: true,
        })
      );

      expect(result.current.expanded).toEqual({});

      act(() => {
        result.current.table.getRow('0').toggleExpanded();
      });

      expect(result.current.expanded).toEqual({ '0': true });
    });

    it('manages focused row index internally', () => {
      const { result } = renderHook(() =>
        useVirtualTable({
          data: testData,
          columns: testColumns,
          enableKeyboardNavigation: true,
        })
      );

      expect(result.current.focusedRowIndex).toBe(-1);

      act(() => {
        result.current.setFocusedRow(1);
      });

      expect(result.current.focusedRowIndex).toBe(1);
    });
  });

  describe('controlled state', () => {
    it('uses controlled row selection', () => {
      const onRowSelectionChange = vi.fn();
      const { result } = renderHook(() =>
        useVirtualTable({
          data: testData,
          columns: testColumns,
          enableRowSelection: true,
          rowSelection: { '1': true },
          onRowSelectionChange,
        })
      );

      expect(result.current.rowSelection).toEqual({ '1': true });

      act(() => {
        result.current.table.getRow('0').toggleSelected();
      });

      expect(onRowSelectionChange).toHaveBeenCalledWith({ '0': true, '1': true });
    });

    it('uses controlled sorting', () => {
      const onSortingChange = vi.fn();
      const { result } = renderHook(() =>
        useVirtualTable({
          data: testData,
          columns: testColumns,
          enableSorting: true,
          sorting: [{ id: 'age', desc: true }],
          onSortingChange,
        })
      );

      expect(result.current.sorting).toEqual([{ id: 'age', desc: true }]);

      act(() => {
        result.current.table.getColumn('name')?.toggleSorting();
      });

      expect(onSortingChange).toHaveBeenCalled();
    });

    it('uses controlled focused row index', () => {
      const onFocusedRowChange = vi.fn();
      const { result } = renderHook(() =>
        useVirtualTable({
          data: testData,
          columns: testColumns,
          enableKeyboardNavigation: true,
          focusedRowIndex: 0,
          onFocusedRowChange,
        })
      );

      expect(result.current.focusedRowIndex).toBe(0);

      act(() => {
        result.current.setFocusedRow(2);
      });

      expect(onFocusedRowChange).toHaveBeenCalledWith(2);
    });
  });

  describe('setFocusedRow', () => {
    it('clamps to valid range', () => {
      const { result } = renderHook(() =>
        useVirtualTable({
          data: testData,
          columns: testColumns,
          enableKeyboardNavigation: true,
        })
      );

      act(() => {
        result.current.setFocusedRow(100);
      });
      expect(result.current.focusedRowIndex).toBe(2); // clamped to max index

      act(() => {
        result.current.setFocusedRow(-10);
      });
      expect(result.current.focusedRowIndex).toBe(-1); // clamped to -1
    });
  });

  describe('reorderColumn', () => {
    it('reorders columns correctly', () => {
      const { result } = renderHook(() =>
        useVirtualTable({
          data: testData,
          columns: testColumns,
          enableColumnReordering: true,
        })
      );

      expect(result.current.columnOrder).toEqual(['id', 'name', 'age']);

      act(() => {
        result.current.reorderColumn('age', 'id');
      });

      expect(result.current.columnOrder).toEqual(['age', 'id', 'name']);
    });

    it('handles invalid column ids gracefully', () => {
      const { result } = renderHook(() =>
        useVirtualTable({
          data: testData,
          columns: testColumns,
          enableColumnReordering: true,
        })
      );

      const initialOrder = result.current.columnOrder;

      act(() => {
        result.current.reorderColumn('nonexistent', 'id');
      });

      expect(result.current.columnOrder).toEqual(initialOrder);
    });
  });

  describe('keyboard navigation', () => {
    it('handleKeyDown navigates with arrow keys', () => {
      const { result } = renderHook(() =>
        useVirtualTable({
          data: testData,
          columns: testColumns,
          enableKeyboardNavigation: true,
        })
      );

      // Start at -1 (no focus)
      expect(result.current.focusedRowIndex).toBe(-1);

      // Simulate ArrowDown
      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
        result.current.handleKeyDown(event as unknown as React.KeyboardEvent);
      });

      expect(result.current.focusedRowIndex).toBe(0);

      // Simulate ArrowDown again
      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
        result.current.handleKeyDown(event as unknown as React.KeyboardEvent);
      });

      expect(result.current.focusedRowIndex).toBe(1);

      // Simulate ArrowUp
      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
        result.current.handleKeyDown(event as unknown as React.KeyboardEvent);
      });

      expect(result.current.focusedRowIndex).toBe(0);
    });

    it('handleKeyDown navigates with Home/End', () => {
      const { result } = renderHook(() =>
        useVirtualTable({
          data: testData,
          columns: testColumns,
          enableKeyboardNavigation: true,
        })
      );

      // Simulate End
      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'End' });
        Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
        result.current.handleKeyDown(event as unknown as React.KeyboardEvent);
      });

      expect(result.current.focusedRowIndex).toBe(2); // last row

      // Simulate Home
      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'Home' });
        Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
        result.current.handleKeyDown(event as unknown as React.KeyboardEvent);
      });

      expect(result.current.focusedRowIndex).toBe(0); // first row
    });

    it('handleKeyDown toggles selection with Space', () => {
      const { result } = renderHook(() =>
        useVirtualTable({
          data: testData,
          columns: testColumns,
          enableKeyboardNavigation: true,
          enableRowSelection: true,
        })
      );

      // Focus first row
      act(() => {
        result.current.setFocusedRow(0);
      });

      expect(result.current.rowSelection).toEqual({});

      // Simulate Space
      act(() => {
        const event = new KeyboardEvent('keydown', { key: ' ' });
        Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
        result.current.handleKeyDown(event as unknown as React.KeyboardEvent);
      });

      expect(result.current.rowSelection).toEqual({ '0': true });
    });

    it('handleKeyDown does nothing when keyboard navigation disabled', () => {
      const { result } = renderHook(() =>
        useVirtualTable({
          data: testData,
          columns: testColumns,
          enableKeyboardNavigation: false,
        })
      );

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
        result.current.handleKeyDown(event as unknown as React.KeyboardEvent);
      });

      expect(result.current.focusedRowIndex).toBe(-1); // unchanged
    });
  });

  describe('virtualizer integration', () => {
    it('provides virtualizer instance', () => {
      const { result } = renderHook(() =>
        useVirtualTable({
          data: testData,
          columns: testColumns,
        })
      );

      expect(result.current.virtualizer).toBeDefined();
      expect(result.current.virtualItems).toBeDefined();
      expect(result.current.totalSize).toBeGreaterThan(0);
    });

    it('respects custom row height', () => {
      const { result } = renderHook(() =>
        useVirtualTable({
          data: testData,
          columns: testColumns,
          rowHeight: 60,
        })
      );

      // Total size should be rowHeight * number of rows
      expect(result.current.totalSize).toBe(60 * 3);
    });
  });
});
