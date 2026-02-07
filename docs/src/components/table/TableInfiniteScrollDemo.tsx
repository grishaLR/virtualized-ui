import { useState, useCallback } from 'react';
import { useVirtualTable } from 'virtualized-ui';
import { flexRender, createColumnHelper } from '@tanstack/react-table';

interface Person {
  id: number;
  name: string;
  email: string;
  department: string;
  salary: number;
}

const generateData = (start: number, count: number): Person[] =>
  Array.from({ length: count }, (_, i) => ({
    id: start + i + 1,
    name: `Person ${start + i + 1}`,
    email: `person${start + i + 1}@example.com`,
    department: ['Engineering', 'Design', 'Product', 'Sales', 'Marketing'][(start + i) % 5],
    salary: 50000 + Math.floor(Math.random() * 100000),
  }));

const columnHelper = createColumnHelper<Person>();

const columns = [
  columnHelper.accessor('id', { header: 'ID', size: 70 }),
  columnHelper.accessor('name', { header: 'Name', size: 160 }),
  columnHelper.accessor('email', { header: 'Email', size: 220 }),
  columnHelper.accessor('department', { header: 'Department', size: 120 }),
  columnHelper.accessor('salary', {
    header: 'Salary',
    size: 100,
    cell: (info) => `$${info.getValue().toLocaleString()}`,
  }),
];

/** Notion-style — clean sans-serif, very minimal borders */
export function TableInfiniteScrollDemo() {
  const [data, setData] = useState(() => generateData(0, 50));
  const [loading, setLoading] = useState(false);

  const loadMore = useCallback(() => {
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      setData((prev) => [...prev, ...generateData(prev.length, 30)]);
      setLoading(false);
    }, 600);
  }, [loading]);

  const { table, rows, virtualItems, totalSize, containerRef, handleScroll } = useVirtualTable({
    data,
    columns,
    rowHeight: 38,
    onScrollToBottom: loadMore,
    scrollBottomThreshold: 200,
  });

  return (
    <div>
      <div
        ref={containerRef}
        className="overflow-auto"
        onScroll={handleScroll}
        style={{
          height: 500,
          background: '#fff',
          borderRadius: 4,
          border: '1px solid #e9e9e7',
        }}
      >
        <div
          className="sticky top-0 z-10"
          style={{
            background: '#fff',
            borderBottom: '1px solid #e9e9e7',
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
                    padding: '6px 10px',
                    fontSize: 12,
                    fontWeight: 500,
                    color: '#9b9a97',
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
                  height: 38,
                  display: 'flex',
                  borderBottom: '1px solid #f1f1ef',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f7f6f3')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {row.getVisibleCells().map((cell) => (
                  <div
                    key={cell.id}
                    style={{
                      width: cell.column.getSize(),
                      minWidth: cell.column.getSize(),
                      padding: '8px 10px',
                      fontSize: 14,
                      color: '#37352f',
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

        {loading && (
          <div style={{ padding: '12px 0', textAlign: 'center', fontSize: 13, color: '#9b9a97' }}>
            Loading more...
          </div>
        )}
      </div>
      <p style={{ fontSize: 12, color: '#9b9a97', marginTop: 8 }}>
        {data.length} rows loaded · Scroll to load more
      </p>
    </div>
  );
}
