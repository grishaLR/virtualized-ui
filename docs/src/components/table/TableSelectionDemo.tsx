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

/** Stripe-style — indigo accent, selected rows glow */
export function TableSelectionDemo({ rowCount = 100 }: { rowCount?: number }) {
  const data = useMemo(() => generateData(rowCount), [rowCount]);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'select',
        size: 44,
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            style={{ accentColor: '#635bff', width: 16, height: 16 }}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            onClick={(e) => e.stopPropagation()}
            style={{ accentColor: '#635bff', width: 16, height: 16 }}
          />
        ),
      }),
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
    []
  );

  const { table, rows, virtualItems, totalSize, containerRef, rowSelection } = useVirtualTable({
    data,
    columns,
    enableRowSelection: true,
    rowHeight: 44,
    getRowId: (row) => String(row.id),
  });

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div>
      {selectedCount > 0 && (
        <div
          style={{
            fontSize: 13,
            color: '#635bff',
            fontWeight: 500,
            marginBottom: 8,
          }}
        >
          {selectedCount} row{selectedCount !== 1 ? 's' : ''} selected
        </div>
      )}
      <div
        ref={containerRef}
        className="overflow-auto"
        style={{
          height: 500,
          borderRadius: 8,
          background: '#fff',
          boxShadow: '0 0 0 1px #e3e8ee, 0 2px 4px rgba(0,0,0,0.04)',
        }}
      >
        <div
          className="sticky top-0 z-10"
          style={{
            background: '#f7f8fa',
            borderBottom: '1px solid #e3e8ee',
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
                    padding: '10px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#697386',
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.04em',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ height: totalSize, position: 'relative' }}>
          {virtualItems.map((virtualRow) => {
            const row = rows[virtualRow.index];
            const isSelected = row.getIsSelected();
            return (
              <div
                key={row.id}
                style={{
                  position: 'absolute',
                  top: virtualRow.start,
                  left: 0,
                  width: '100%',
                  height: 44,
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: '1px solid #f0f2f5',
                  background: isSelected ? '#f0edff' : '#fff',
                  boxShadow: isSelected ? 'inset 3px 0 0 #635bff' : 'none',
                  transition: 'background 0.15s, box-shadow 0.15s',
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <div
                    key={cell.id}
                    style={{
                      width: cell.column.getSize(),
                      minWidth: cell.column.getSize(),
                      padding: '0 12px',
                      fontSize: 14,
                      color: '#3c4257',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
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
      <p style={{ fontSize: 12, color: '#8792a2', marginTop: 8 }}>
        {rowCount.toLocaleString()} rows
      </p>
    </div>
  );
}
