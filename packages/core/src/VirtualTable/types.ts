import type {
  ColumnDef,
  RowSelectionState,
  SortingState,
  ExpandedState,
  ColumnSizingState,
  ColumnResizeMode,
  ColumnOrderState,
  Row,
} from '@tanstack/react-table';
import type { Virtualizer } from '@tanstack/react-virtual';
import type { RefObject, CSSProperties, ReactNode } from 'react';

export interface VirtualTableProps<TData> {
  /** Array of data items to render in the table */
  data: TData[];

  /** TanStack Table column definitions */
  columns: ColumnDef<TData, any>[];

  /** Height of each row in pixels (used for virtualization) */
  rowHeight?: number;

  /** Height of the table container (CSS value) */
  height?: number | string;

  /** Number of rows to render outside visible area */
  overscan?: number;

  /** Enable row selection */
  enableRowSelection?: boolean;

  /** Controlled row selection state */
  rowSelection?: RowSelectionState;

  /** Callback when row selection changes */
  onRowSelectionChange?: (selection: RowSelectionState) => void;

  /** Enable sorting */
  enableSorting?: boolean;

  /** Controlled sorting state */
  sorting?: SortingState;

  /** Callback when sorting changes */
  onSortingChange?: (sorting: SortingState) => void;

  /** Enable multi-column sorting (hold Shift to add sort) */
  enableMultiSort?: boolean;

  /** Maximum number of columns that can be sorted at once */
  maxMultiSortColCount?: number;

  /** Enable sticky header */
  stickyHeader?: boolean;

  /** Enable column resizing */
  enableColumnResizing?: boolean;

  /** Column resize mode: 'onChange' updates live, 'onEnd' updates on mouse up */
  columnResizeMode?: ColumnResizeMode;

  /** Controlled column sizing state */
  columnSizing?: ColumnSizingState;

  /** Callback when column sizing changes */
  onColumnSizingChange?: (sizing: ColumnSizingState) => void;

  /** Enable column reordering (drag and drop) */
  enableColumnReordering?: boolean;

  /** Controlled column order state */
  columnOrder?: ColumnOrderState;

  /** Callback when column order changes */
  onColumnOrderChange?: (order: ColumnOrderState) => void;

  /** Enable row expansion */
  enableRowExpansion?: boolean;

  /** Controlled expanded state */
  expanded?: ExpandedState;

  /** Callback when expanded state changes */
  onExpandedChange?: (expanded: ExpandedState) => void;

  /** Height of expanded row content in pixels */
  expandedRowHeight?: number;

  /** Render function for expanded row content */
  renderExpandedRow?: (row: Row<TData>) => ReactNode;

  /** Determine if a row can be expanded (defaults to true for all rows) */
  getRowCanExpand?: (row: Row<TData>) => boolean;

  /** Called when user scrolls to bottom (useful for infinite loading) */
  onScrollToBottom?: () => void;

  /** Threshold in pixels before bottom to trigger onScrollToBottom */
  scrollBottomThreshold?: number;

  /** Get unique row ID (defaults to index) */
  getRowId?: (row: TData, index: number) => string;

  /** Enable keyboard navigation (arrow keys, Enter, Space) */
  enableKeyboardNavigation?: boolean;

  /** Controlled focused row index */
  focusedRowIndex?: number;

  /** Callback when focused row changes */
  onFocusedRowChange?: (index: number) => void;

  /** Class name for the container */
  className?: string;

  /** Style for the container */
  style?: CSSProperties;
}

export interface VirtualTableRenderProps<TData> {
  /** The TanStack Table rows */
  rows: Row<TData>[];

  /** The virtualizer instance */
  virtualizer: Virtualizer<HTMLDivElement, Element>;

  /** Virtual items to render */
  virtualItems: ReturnType<Virtualizer<HTMLDivElement, Element>['getVirtualItems']>;

  /** Total height of all rows */
  totalSize: number;

  /** Ref for the scroll container */
  containerRef: RefObject<HTMLDivElement>;

  /** Columns from the table */
  columns: ColumnDef<TData, any>[];
}

export interface UseVirtualTableOptions<TData> extends Pick<
  VirtualTableProps<TData>,
  | 'data'
  | 'columns'
  | 'rowHeight'
  | 'overscan'
  | 'enableRowSelection'
  | 'rowSelection'
  | 'onRowSelectionChange'
  | 'enableSorting'
  | 'sorting'
  | 'onSortingChange'
  | 'enableMultiSort'
  | 'maxMultiSortColCount'
  | 'enableColumnResizing'
  | 'columnResizeMode'
  | 'columnSizing'
  | 'onColumnSizingChange'
  | 'enableColumnReordering'
  | 'columnOrder'
  | 'onColumnOrderChange'
  | 'enableRowExpansion'
  | 'expanded'
  | 'onExpandedChange'
  | 'expandedRowHeight'
  | 'getRowCanExpand'
  | 'getRowId'
  | 'enableKeyboardNavigation'
  | 'focusedRowIndex'
  | 'onFocusedRowChange'
  | 'onScrollToBottom'
  | 'scrollBottomThreshold'
> {}
