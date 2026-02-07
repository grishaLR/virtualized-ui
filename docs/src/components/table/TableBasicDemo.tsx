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

/** Clean minimal — white bg, thin gray borders, no color */
export function TableBasicDemo({ rowCount = 1000 }: { rowCount?: number }) {
  const data = useMemo(() => generateData(rowCount), [rowCount]);

  const { table, rows, virtualItems, totalSize, containerRef } = useVirtualTable({
    data,
    columns,
    rowHeight: 40,
  });

  return (
    <div>
      <div
        ref={containerRef}
        className="overflow-auto"
        style={{
          height: 500,
          border: '1px solid #e5e7eb',
          borderRadius: 6,
          background: '#fff',
        }}
      >
        <div
          className="sticky top-0 z-10"
          style={{ background: '#fff', borderBottom: '2px solid #e5e7eb' }}
        >
          {table.getHeaderGroups().map((headerGroup) => (
            <div key={headerGroup.id} style={{ display: 'flex' }}>
              {headerGroup.headers.map((header) => (
                <div
                  key={header.id}
                  style={{
                    width: header.getSize(),
                    minWidth: header.getSize(),
                    padding: '10px 12px',
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#6b7280',
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                  }}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
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
                style={{
                  position: 'absolute',
                  top: virtualRow.start,
                  left: 0,
                  width: '100%',
                  height: 40,
                  display: 'flex',
                  borderBottom: '1px solid #f3f4f6',
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <div
                    key={cell.id}
                    style={{
                      width: cell.column.getSize(),
                      minWidth: cell.column.getSize(),
                      padding: '10px 12px',
                      fontSize: 14,
                      color: '#374151',
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
      <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>
        {rowCount.toLocaleString()} rows
      </p>
    </div>
  );
}
