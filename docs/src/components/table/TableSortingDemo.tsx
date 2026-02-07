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

const columns = [
  columnHelper.accessor('id', { header: 'ID', size: 70 }),
  columnHelper.accessor('name', { header: 'Name', size: 150 }),
  columnHelper.accessor('email', { header: 'Email', size: 220 }),
  columnHelper.accessor('department', { header: 'Department', size: 120 }),
  columnHelper.accessor('salary', {
    header: 'Salary',
    size: 100,
    cell: (info) => `$${info.getValue().toLocaleString()}`,
  }),
];

/** GitHub-style — light gray header, subtle row hovers */
export function TableSortingDemo({
  rowCount = 100,
  enableMultiSort = false,
}: {
  rowCount?: number;
  enableMultiSort?: boolean;
}) {
  const data = useMemo(() => generateData(rowCount), [rowCount]);

  const { table, rows, virtualItems, totalSize, containerRef, sorting } = useVirtualTable({
    data,
    columns,
    enableSorting: true,
    enableMultiSort,
    rowHeight: 40,
  });

  return (
    <div>
      {sorting.length > 0 && (
        <div style={{ fontSize: 13, color: '#57606a', marginBottom: 8 }}>
          Sorted by: {sorting.map((s) => `${s.id} ${s.desc ? '↓' : '↑'}`).join(', ')}
        </div>
      )}
      <div
        ref={containerRef}
        className="overflow-auto"
        style={{
          height: 500,
          border: '1px solid #d0d7de',
          borderRadius: 6,
          background: '#ffffff',
        }}
      >
        <div
          className="sticky top-0 z-10"
          style={{ background: '#f6f8fa', borderBottom: '1px solid #d0d7de' }}
        >
          {table.getHeaderGroups().map((headerGroup) => (
            <div key={headerGroup.id} style={{ display: 'flex' }}>
              {headerGroup.headers.map((header) => (
                <div
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  style={{
                    width: header.getSize(),
                    minWidth: header.getSize(),
                    padding: '8px 16px',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#24292f',
                    cursor: header.column.getCanSort() ? 'pointer' : 'default',
                    userSelect: 'none',
                  }}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getIsSorted() === 'asc' && ' ▲'}
                  {header.column.getIsSorted() === 'desc' && ' ▼'}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ height: totalSize, position: 'relative' }}>
          {virtualItems.map((virtualRow) => {
            const row = rows[virtualRow.index];
            return (
              <div
                key={row.id}
                className="github-row"
                style={{
                  position: 'absolute',
                  top: virtualRow.start,
                  left: 0,
                  width: '100%',
                  height: 40,
                  display: 'flex',
                  borderBottom: '1px solid #d8dee4',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f6f8fa')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {row.getVisibleCells().map((cell) => (
                  <div
                    key={cell.id}
                    style={{
                      width: cell.column.getSize(),
                      minWidth: cell.column.getSize(),
                      padding: '8px 16px',
                      fontSize: 14,
                      color: '#24292f',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
      <p style={{ fontSize: 12, color: '#57606a', marginTop: 8 }}>
        {rowCount.toLocaleString()} rows
        {enableMultiSort && ' · Hold Shift to multi-sort'}
      </p>
    </div>
  );
}
