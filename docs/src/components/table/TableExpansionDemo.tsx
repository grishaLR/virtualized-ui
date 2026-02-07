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

/** Material-style — elevated cards, shadow on expand */
export function TableExpansionDemo({ rowCount = 50 }: { rowCount?: number }) {
  const data = useMemo(() => generateData(rowCount), [rowCount]);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'expand',
        size: 48,
        cell: ({ row }) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              row.toggleExpanded();
            }}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 18,
              color: '#5f6368',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.2s, background 0.2s',
              transform: row.getIsExpanded() ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f3f4')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            ▾
          </button>
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

  const { table, rows, virtualizer, virtualItems, totalSize, containerRef } = useVirtualTable({
    data,
    columns,
    enableRowExpansion: true,
    rowHeight: 48,
    expandedRowHeight: 100,
    getRowId: (row) => String(row.id),
  });

  return (
    <div>
      <div
        ref={containerRef}
        className="overflow-auto"
        style={{
          height: 500,
          borderRadius: 8,
          background: '#fafafa',
        }}
      >
        <div
          className="sticky top-0 z-10"
          style={{
            background: '#fff',
            borderBottom: '1px solid #e0e0e0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
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
                    padding: '14px 16px',
                    fontSize: 12,
                    fontWeight: 500,
                    color: '#5f6368',
                    letterSpacing: '0.02em',
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
            const isExpanded = row.getIsExpanded();
            return (
              <div
                key={row.id}
                data-index={virtualRow.index}
                ref={(node) => virtualizer.measureElement(node)}
                style={{
                  position: 'absolute',
                  top: virtualRow.start,
                  left: 0,
                  width: '100%',
                  background: '#fff',
                  borderBottom: isExpanded ? 'none' : '1px solid #f0f0f0',
                  boxShadow: isExpanded
                    ? '0 2px 8px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.06)'
                    : 'none',
                  borderRadius: isExpanded ? 8 : 0,
                  margin: isExpanded ? '4px 8px' : 0,
                  zIndex: isExpanded ? 1 : 0,
                  transition: 'box-shadow 0.2s',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    height: 48,
                    alignItems: 'center',
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <div
                      key={cell.id}
                      style={{
                        width: cell.column.getSize(),
                        minWidth: cell.column.getSize(),
                        padding: '0 16px',
                        fontSize: 14,
                        color: '#202124',
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
                {isExpanded && (
                  <div
                    style={{
                      padding: '12px 16px 16px 64px',
                      background: '#f8f9fa',
                      borderTop: '1px solid #e8eaed',
                      borderRadius: '0 0 8px 8px',
                      fontSize: 13,
                      color: '#5f6368',
                      lineHeight: 1.6,
                    }}
                  >
                    <strong style={{ color: '#202124' }}>Employee Details</strong>
                    <br />
                    ID: {row.original.id} · Department: {row.original.department} · Salary: $
                    {row.original.salary.toLocaleString()}
                    <br />
                    Contact: {row.original.email}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <p style={{ fontSize: 12, color: '#9aa0a6', marginTop: 8 }}>
        {rowCount.toLocaleString()} rows · Click arrow to expand
      </p>
    </div>
  );
}
