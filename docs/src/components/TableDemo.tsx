import { useMemo } from 'react';
import { useVirtualTable } from 'virtualized-ui';
import { flexRender, createColumnHelper } from '@tanstack/react-table';

interface Person {
  id: number;
  name: string;
  email: string;
  department: string;
  salary: number;
}

const generateData = (count: number): Person[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Person ${i + 1}`,
    email: `person${i + 1}@example.com`,
    department: ['Engineering', 'Design', 'Product', 'Sales', 'Marketing'][i % 5],
    salary: 50000 + Math.floor(Math.random() * 100000),
  }));

const columnHelper = createColumnHelper<Person>();

interface TableDemoProps {
  rowCount?: number;
  height?: number;
  enableSorting?: boolean;
  enableMultiSort?: boolean;
  enableRowSelection?: boolean;
  enableRowExpansion?: boolean;
  enableKeyboardNavigation?: boolean;
  showFeatureLabel?: string;
}

export function TableDemo({
  rowCount = 100,
  height = 350,
  enableSorting = false,
  enableMultiSort = false,
  enableRowSelection = false,
  enableRowExpansion = false,
  enableKeyboardNavigation = false,
  showFeatureLabel,
}: TableDemoProps) {
  const data = useMemo(() => generateData(rowCount), [rowCount]);

  const columns = useMemo(
    () => [
      ...(enableRowSelection
        ? [
            columnHelper.display({
              id: 'select',
              size: 40,
              header: ({ table }) => (
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={table.getIsAllRowsSelected()}
                  onChange={table.getToggleAllRowsSelectedHandler()}
                />
              ),
              cell: ({ row }) => (
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={row.getIsSelected()}
                  onChange={row.getToggleSelectedHandler()}
                  onClick={(e) => e.stopPropagation()}
                />
              ),
            }),
          ]
        : []),
      ...(enableRowExpansion
        ? [
            columnHelper.display({
              id: 'expand',
              size: 40,
              cell: ({ row }) => (
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    row.toggleExpanded();
                  }}
                >
                  {row.getIsExpanded() ? '−' : '+'}
                </button>
              ),
            }),
          ]
        : []),
      columnHelper.accessor('id', { header: 'ID', size: 70 }),
      columnHelper.accessor('name', { header: 'Name', size: 150 }),
      columnHelper.accessor('email', { header: 'Email', size: 220 }),
      columnHelper.accessor('department', { header: 'Department', size: 120 }),
      columnHelper.accessor('salary', {
        header: 'Salary',
        size: 100,
        cell: (info) => `$${info.getValue().toLocaleString()}`,
      }),
    ],
    [enableRowSelection, enableRowExpansion]
  );

  const {
    table,
    rows,
    virtualizer,
    virtualItems,
    totalSize,
    containerRef,
    rowSelection,
    sorting,
    focusedRowIndex,
    handleKeyDown,
  } = useVirtualTable({
    data,
    columns,
    enableSorting,
    enableMultiSort,
    enableRowSelection,
    enableRowExpansion,
    enableKeyboardNavigation,
    rowHeight: 44,
    expandedRowHeight: 80,
    getRowId: (row) => String(row.id),
  });

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div>
      {/* Status bar */}
      <div className="flex items-center gap-4 text-sm text-base-content/70 min-h-[20px]">
        {showFeatureLabel && (
          <span className="badge badge-sm badge-primary">{showFeatureLabel}</span>
        )}
        {enableRowSelection && selectedCount > 0 && (
          <span>
            {selectedCount} row{selectedCount !== 1 ? 's' : ''} selected
          </span>
        )}
        {enableSorting && sorting.length > 0 && (
          <span>Sorted by: {sorting.map((s) => `${s.id} ${s.desc ? '↓' : '↑'}`).join(', ')}</span>
        )}
        {enableKeyboardNavigation && focusedRowIndex >= 0 && (
          <span>Focused: Row {focusedRowIndex + 1}</span>
        )}
      </div>

      <div
        ref={containerRef}
        className="overflow-auto border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
        style={{ height }}
        tabIndex={enableKeyboardNavigation ? 0 : undefined}
        onKeyDown={enableKeyboardNavigation ? handleKeyDown : undefined}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-base-200 border-b border-base-300">
          {table.getHeaderGroups().map((headerGroup) => (
            <div key={headerGroup.id} className="flex">
              {headerGroup.headers.map((header) => (
                <div
                  key={header.id}
                  className={`px-3 py-2 text-sm font-semibold ${
                    header.column.getCanSort() ? 'cursor-pointer select-none hover:bg-base-300' : ''
                  }`}
                  style={{ width: header.getSize(), minWidth: header.getSize() }}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getIsSorted() === 'asc' && ' ↑'}
                  {header.column.getIsSorted() === 'desc' && ' ↓'}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Body */}
        <div style={{ height: totalSize, position: 'relative' }}>
          {virtualItems.map((virtualRow) => {
            const row = rows[virtualRow.index];
            const isExpanded = row.getIsExpanded();
            const isFocused = enableKeyboardNavigation && virtualRow.index === focusedRowIndex;

            return (
              <div
                key={row.id}
                data-index={virtualRow.index}
                ref={(node) => virtualizer.measureElement(node)}
                className={`absolute left-0 w-full border-b border-base-200 ${
                  row.getIsSelected() ? 'bg-primary/10' : ''
                } ${isFocused ? 'ring-2 ring-inset ring-primary' : 'hover:bg-base-200/50'}`}
                style={{ top: virtualRow.start }}
              >
                <div className="flex h-[44px]">
                  {row.getVisibleCells().map((cell) => (
                    <div
                      key={cell.id}
                      className="px-3 py-2 text-sm truncate flex items-center"
                      style={{ width: cell.column.getSize(), minWidth: cell.column.getSize() }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  ))}
                </div>
                {isExpanded && (
                  <div className="h-[80px] px-4 py-3 bg-base-200/50 text-sm border-t border-base-300">
                    <p className="font-medium mb-1">Employee Details</p>
                    <p className="text-base-content/70">
                      ID: {row.original.id} • Department: {row.original.department} • Salary: $
                      {row.original.salary.toLocaleString()}
                    </p>
                    <p className="text-base-content/70">Contact: {row.original.email}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-xs text-base-content/50">
        {rowCount.toLocaleString()} rows
        {enableMultiSort && enableSorting && ' • Hold Shift to multi-sort'}
        {enableKeyboardNavigation && ' • Use arrow keys to navigate, Space to select'}
      </div>
    </div>
  );
}
