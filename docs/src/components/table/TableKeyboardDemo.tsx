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
  columnHelper.accessor('department', { header: 'Dept', size: 120 }),
  columnHelper.accessor('salary', {
    header: 'Salary',
    size: 100,
    cell: (info) => `$${info.getValue().toLocaleString()}`,
  }),
];

/** Terminal/dark — dark bg, green accent, monospace feel */
export function TableKeyboardDemo({ rowCount = 100 }: { rowCount?: number }) {
  const data = useMemo(() => generateData(rowCount), [rowCount]);

  const { table, rows, virtualItems, totalSize, containerRef, focusedRowIndex, handleKeyDown } =
    useVirtualTable({
      data,
      columns,
      enableKeyboardNavigation: true,
      enableRowSelection: true,
      rowHeight: 36,
      getRowId: (row) => String(row.id),
    });

  return (
    <div>
      <div
        style={{
          fontSize: 12,
          color: '#4ade80',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          marginBottom: 8,
        }}
      >
        {focusedRowIndex >= 0
          ? `> cursor: row ${focusedRowIndex + 1}`
          : '> click table, use ↑↓ arrows'}
      </div>
      <div
        ref={containerRef}
        className="overflow-auto focus:outline-none"
        style={{
          height: 500,
          borderRadius: 6,
          background: '#0d1117',
          border: '1px solid #30363d',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        }}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <div
          className="sticky top-0 z-10"
          style={{
            background: '#161b22',
            borderBottom: '1px solid #30363d',
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
                    padding: '8px 12px',
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#4ade80',
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.08em',
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
            const isFocused = virtualRow.index === focusedRowIndex;
            const isSelected = row.getIsSelected();
            return (
              <div
                key={row.id}
                style={{
                  position: 'absolute',
                  top: virtualRow.start,
                  left: 0,
                  width: '100%',
                  height: 36,
                  display: 'flex',
                  borderBottom: '1px solid #21262d',
                  background: isFocused ? '#1a3a2a' : isSelected ? '#1c2333' : 'transparent',
                  boxShadow: isFocused ? 'inset 2px 0 0 #4ade80' : 'none',
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <div
                    key={cell.id}
                    style={{
                      width: cell.column.getSize(),
                      minWidth: cell.column.getSize(),
                      padding: '8px 12px',
                      fontSize: 13,
                      color: isFocused ? '#e6edf3' : '#8b949e',
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
      <p
        style={{
          fontSize: 11,
          color: '#484f58',
          marginTop: 8,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        }}
      >
        ↑↓ navigate · Space select · Home/End jump
      </p>
    </div>
  );
}
