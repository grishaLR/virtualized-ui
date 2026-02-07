import { useMemo, useState, useRef } from 'react';
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

const headerColors = ['#e8d5f5', '#d5e8f5', '#d5f5e8', '#f5e8d5', '#f5d5d5'];

/** Kanban/drag-style — rounded, pastel header columns */
export function TableReorderingDemo({ rowCount = 50 }: { rowCount?: number }) {
  const data = useMemo(() => generateData(rowCount), [rowCount]);
  const dragRef = useRef<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const { table, rows, virtualItems, totalSize, containerRef, reorderColumn, columnOrder } =
    useVirtualTable({
      data,
      columns,
      enableColumnReordering: true,
      rowHeight: 42,
    });

  const currentColumns =
    columnOrder.length > 0 ? columnOrder : columns.map((c) => c.accessorKey || c.id || '');

  return (
    <div>
      <div
        ref={containerRef}
        className="overflow-auto"
        style={{
          height: 500,
          borderRadius: 12,
          background: '#fafafa',
          border: '1px solid #e8e8e8',
        }}
      >
        <div
          className="sticky top-0 z-10"
          style={{
            background: '#fafafa',
            padding: '8px 4px 0',
          }}
        >
          {table.getHeaderGroups().map((headerGroup) => (
            <div key={headerGroup.id} style={{ display: 'flex', gap: 4 }}>
              {headerGroup.headers.map((header, i) => {
                const colIndex = currentColumns.indexOf(header.id);
                const bg =
                  headerColors[
                    colIndex >= 0 ? colIndex % headerColors.length : i % headerColors.length
                  ];
                return (
                  <div
                    key={header.id}
                    draggable
                    onDragStart={() => {
                      dragRef.current = header.id;
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(header.id);
                    }}
                    onDragLeave={() => setDragOver(null)}
                    onDrop={() => {
                      if (dragRef.current && dragRef.current !== header.id) {
                        reorderColumn(dragRef.current, header.id);
                      }
                      dragRef.current = null;
                      setDragOver(null);
                    }}
                    style={{
                      width: header.getSize(),
                      minWidth: header.getSize(),
                      padding: '8px 12px',
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#444',
                      background: bg,
                      borderRadius: '8px 8px 0 0',
                      cursor: 'grab',
                      userSelect: 'none',
                      border:
                        dragOver === header.id ? '2px dashed #a78bfa' : '2px solid transparent',
                      transition: 'border 0.15s',
                    }}
                  >
                    ⠿ {flexRender(header.column.columnDef.header, header.getContext())}
                  </div>
                );
              })}
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
                  height: 42,
                  display: 'flex',
                  gap: 4,
                  padding: '0 4px',
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
                      color: '#555',
                      background: '#fff',
                      borderBottom: '1px solid #f0f0f0',
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
      <p style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
        {rowCount.toLocaleString()} rows · Drag column headers to reorder
      </p>
    </div>
  );
}
