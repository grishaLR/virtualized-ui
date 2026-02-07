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

/** Spreadsheet-style — strong grid lines, blue resize handles */
export function TableResizingDemo({ rowCount = 100 }: { rowCount?: number }) {
  const data = useMemo(() => generateData(rowCount), [rowCount]);

  const { table, rows, virtualItems, totalSize, containerRef } = useVirtualTable({
    data,
    columns,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    rowHeight: 32,
  });

  return (
    <div>
      <div
        ref={containerRef}
        className="overflow-auto"
        style={{
          height: 500,
          border: '2px solid #4472c4',
          borderRadius: 2,
          background: '#fff',
        }}
      >
        <div
          className="sticky top-0 z-10"
          style={{
            background: '#4472c4',
          }}
        >
          {table.getHeaderGroups().map((headerGroup) => (
            <div key={headerGroup.id} style={{ display: 'flex' }}>
              {headerGroup.headers.map((header) => (
                <div
                  key={header.id}
                  style={{
                    width: header.getSize(),
                    minWidth: header.getSize(),
                    padding: '6px 8px',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#fff',
                    borderRight: '1px solid #5a85cc',
                    position: 'relative',
                    userSelect: 'none',
                  }}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  <div
                    onMouseDown={header.getResizeHandler()}
                    onTouchStart={header.getResizeHandler()}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      height: '100%',
                      width: 5,
                      cursor: 'col-resize',
                      background: header.column.getIsResizing() ? '#a8c4e6' : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!header.column.getIsResizing())
                        e.currentTarget.style.background = '#8ab0db';
                    }}
                    onMouseLeave={(e) => {
                      if (!header.column.getIsResizing())
                        e.currentTarget.style.background = 'transparent';
                    }}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ height: totalSize, position: 'relative' }}>
          {virtualItems.map((virtualRow) => {
            const row = rows[virtualRow.index];
            const isEven = virtualRow.index % 2 === 0;
            return (
              <div
                key={row.id}
                style={{
                  position: 'absolute',
                  top: virtualRow.start,
                  left: 0,
                  width: '100%',
                  height: 32,
                  display: 'flex',
                  background: isEven ? '#fff' : '#d6e4f0',
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <div
                    key={cell.id}
                    style={{
                      width: cell.column.getSize(),
                      minWidth: cell.column.getSize(),
                      padding: '6px 8px',
                      fontSize: 13,
                      color: '#333',
                      borderRight: '1px solid #c5d9ed',
                      borderBottom: '1px solid #c5d9ed',
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
      <p style={{ fontSize: 12, color: '#8c8c8c', marginTop: 8 }}>
        {rowCount.toLocaleString()} rows · Drag column borders to resize
      </p>
    </div>
  );
}
