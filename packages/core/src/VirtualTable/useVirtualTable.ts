import { useRef, useCallback, useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  type RowSelectionState,
  type SortingState,
  type ExpandedState,
  type ColumnSizingState,
  type ColumnOrderState,
  type Updater,
  type ColumnDef,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { UseVirtualTableOptions } from './types';

const DEFAULT_ROW_HEIGHT = 40;
const DEFAULT_EXPANDED_ROW_HEIGHT = 200;
const DEFAULT_OVERSCAN = 5;
const DEFAULT_SCROLL_THRESHOLD = 100;

/** Extract column ID from a ColumnDef */
function getColumnId<TData>(column: ColumnDef<TData, unknown>): string {
  // Check for explicit id first
  if ('id' in column && typeof column.id === 'string') {
    return column.id;
  }
  // Fall back to accessorKey for accessor columns
  if ('accessorKey' in column && typeof column.accessorKey === 'string') {
    return column.accessorKey;
  }
  return '';
}

export function useVirtualTable<TData>(options: UseVirtualTableOptions<TData>) {
  const {
    data,
    columns,
    rowHeight = DEFAULT_ROW_HEIGHT,
    overscan = DEFAULT_OVERSCAN,
    enableRowSelection = false,
    rowSelection: controlledRowSelection,
    onRowSelectionChange,
    enableSorting = false,
    sorting: controlledSorting,
    onSortingChange,
    enableMultiSort = false,
    maxMultiSortColCount,
    enableColumnResizing = false,
    columnResizeMode = 'onChange',
    columnSizing: controlledColumnSizing,
    onColumnSizingChange,
    enableColumnReordering = false,
    columnOrder: controlledColumnOrder,
    onColumnOrderChange,
    enableRowExpansion = false,
    expanded: controlledExpanded,
    onExpandedChange,
    expandedRowHeight = DEFAULT_EXPANDED_ROW_HEIGHT,
    getRowCanExpand,
    getRowId,
    enableKeyboardNavigation = false,
    focusedRowIndex: controlledFocusedRowIndex,
    onFocusedRowChange,
    onScrollToBottom,
    scrollBottomThreshold = DEFAULT_SCROLL_THRESHOLD,
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);

  // Default column order from column definitions
  const defaultColumnOrder = useMemo(() => columns.map(getColumnId), [columns]);

  // Internal state for uncontrolled mode
  const [internalRowSelection, setInternalRowSelection] = useState<RowSelectionState>({});
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const [internalExpanded, setInternalExpanded] = useState<ExpandedState>({});
  const [internalColumnSizing, setInternalColumnSizing] = useState<ColumnSizingState>({});
  const [internalColumnOrder, setInternalColumnOrder] = useState<ColumnOrderState>([]);
  const [internalFocusedRowIndex, setInternalFocusedRowIndex] = useState<number>(-1);

  // Use controlled or internal state
  const rowSelectionState = controlledRowSelection ?? internalRowSelection;
  const sortingState = controlledSorting ?? internalSorting;
  const expandedState = controlledExpanded ?? internalExpanded;
  const columnSizingState = controlledColumnSizing ?? internalColumnSizing;
  const columnOrderState =
    controlledColumnOrder ??
    (internalColumnOrder.length ? internalColumnOrder : defaultColumnOrder);
  const focusedRowIndex = controlledFocusedRowIndex ?? internalFocusedRowIndex;

  const handleRowSelectionChange = useCallback(
    (updater: Updater<RowSelectionState>) => {
      const newValue = typeof updater === 'function' ? updater(rowSelectionState) : updater;
      if (onRowSelectionChange) {
        onRowSelectionChange(newValue);
      } else {
        setInternalRowSelection(newValue);
      }
    },
    [rowSelectionState, onRowSelectionChange]
  );

  const handleSortingChange = useCallback(
    (updater: Updater<SortingState>) => {
      const newValue = typeof updater === 'function' ? updater(sortingState) : updater;
      if (onSortingChange) {
        onSortingChange(newValue);
      } else {
        setInternalSorting(newValue);
      }
    },
    [sortingState, onSortingChange]
  );

  const handleExpandedChange = useCallback(
    (updater: Updater<ExpandedState>) => {
      const newValue = typeof updater === 'function' ? updater(expandedState) : updater;
      if (onExpandedChange) {
        onExpandedChange(newValue);
      } else {
        setInternalExpanded(newValue);
      }
    },
    [expandedState, onExpandedChange]
  );

  const handleColumnSizingChange = useCallback(
    (updater: Updater<ColumnSizingState>) => {
      const newValue = typeof updater === 'function' ? updater(columnSizingState) : updater;
      if (onColumnSizingChange) {
        onColumnSizingChange(newValue);
      } else {
        setInternalColumnSizing(newValue);
      }
    },
    [columnSizingState, onColumnSizingChange]
  );

  const handleColumnOrderChange = useCallback(
    (updater: Updater<ColumnOrderState>) => {
      const newValue = typeof updater === 'function' ? updater(columnOrderState) : updater;
      if (onColumnOrderChange) {
        onColumnOrderChange(newValue);
      } else {
        setInternalColumnOrder(newValue);
      }
    },
    [columnOrderState, onColumnOrderChange]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getExpandedRowModel: enableRowExpansion ? getExpandedRowModel() : undefined,
    enableRowSelection,
    enableSorting,
    enableMultiSort,
    maxMultiSortColCount,
    enableColumnResizing,
    columnResizeMode,
    getRowCanExpand: enableRowExpansion ? (getRowCanExpand ?? (() => true)) : undefined,
    state: {
      rowSelection: rowSelectionState,
      sorting: sortingState,
      expanded: expandedState,
      columnSizing: columnSizingState,
      columnOrder: enableColumnReordering ? columnOrderState : undefined,
    },
    onRowSelectionChange: handleRowSelectionChange,
    onSortingChange: handleSortingChange,
    onExpandedChange: handleExpandedChange,
    onColumnSizingChange: handleColumnSizingChange,
    onColumnOrderChange: enableColumnReordering ? handleColumnOrderChange : undefined,
    getRowId,
  });

  const { rows } = table.getRowModel();

  // Dynamic row height estimation based on expanded state
  const estimateSize = useCallback(
    (index: number) => {
      if (!enableRowExpansion) return rowHeight;
      const row = rows[index];
      return row?.getIsExpanded() ? rowHeight + expandedRowHeight : rowHeight;
    },
    [rows, rowHeight, expandedRowHeight, enableRowExpansion]
  );

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => containerRef.current,
    estimateSize,
    overscan,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  // Handle scroll to bottom detection
  const handleScroll = useCallback(() => {
    if (!onScrollToBottom || !containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    if (distanceFromBottom < scrollBottomThreshold) {
      onScrollToBottom();
    }
  }, [onScrollToBottom, scrollBottomThreshold]);

  // Helper to reorder columns (for drag and drop)
  const reorderColumn = useCallback(
    (draggedColumnId: string, targetColumnId: string) => {
      const newOrder = [...columnOrderState];
      const draggedIndex = newOrder.indexOf(draggedColumnId);
      const targetIndex = newOrder.indexOf(targetColumnId);

      if (draggedIndex === -1 || targetIndex === -1) return;

      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedColumnId);

      handleColumnOrderChange(newOrder);
    },
    [columnOrderState, handleColumnOrderChange]
  );

  // Focus row change handler
  const setFocusedRow = useCallback(
    (index: number) => {
      const clampedIndex = Math.max(-1, Math.min(index, rows.length - 1));
      if (onFocusedRowChange) {
        onFocusedRowChange(clampedIndex);
      } else {
        setInternalFocusedRowIndex(clampedIndex);
      }
      // Scroll focused row into view
      if (clampedIndex >= 0) {
        virtualizer.scrollToIndex(clampedIndex, { align: 'auto' });
      }
    },
    [rows.length, onFocusedRowChange, virtualizer]
  );

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!enableKeyboardNavigation) return;

      const currentIndex = focusedRowIndex;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedRow(currentIndex + 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedRow(currentIndex - 1);
          break;
        case 'Home':
          e.preventDefault();
          setFocusedRow(0);
          break;
        case 'End':
          e.preventDefault();
          setFocusedRow(rows.length - 1);
          break;
        case 'Enter':
          if (currentIndex >= 0 && enableRowExpansion) {
            e.preventDefault();
            const row = rows[currentIndex];
            if (row?.getCanExpand()) {
              row.toggleExpanded();
            }
          }
          break;
        case ' ':
          if (currentIndex >= 0 && enableRowSelection) {
            e.preventDefault();
            const row = rows[currentIndex];
            row?.toggleSelected();
          }
          break;
      }
    },
    [
      enableKeyboardNavigation,
      focusedRowIndex,
      rows,
      enableRowExpansion,
      enableRowSelection,
      setFocusedRow,
    ]
  );

  return {
    table,
    rows,
    virtualizer,
    virtualItems,
    totalSize,
    containerRef,
    handleScroll,
    handleKeyDown,
    reorderColumn,
    setFocusedRow,
    // Expose state for consumers
    rowSelection: rowSelectionState,
    sorting: sortingState,
    expanded: expandedState,
    columnSizing: columnSizingState,
    columnOrder: columnOrderState,
    focusedRowIndex,
  };
}
