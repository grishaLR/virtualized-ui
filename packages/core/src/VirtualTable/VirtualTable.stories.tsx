import { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { VirtualTable } from './VirtualTable';
import {
  createColumnHelper,
  type RowSelectionState,
  type SortingState,
  type ExpandedState,
  type ColumnSizingState,
  type ColumnOrderState,
  type Row,
} from '@tanstack/react-table';

interface Person {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  status: 'active' | 'inactive' | 'pending';
}

// Generate mock data
function generatePeople(count: number): Person[] {
  const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Eve', 'Frank'];
  const lastNames = ['Smith', 'Doe', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller'];
  const statuses: Person['status'][] = ['active', 'inactive', 'pending'];

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
    lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
    age: Math.floor(Math.random() * 50) + 20,
    email: `user${i + 1}@example.com`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
  }));
}

const columnHelper = createColumnHelper<Person>();

const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
    size: 80,
  }),
  columnHelper.accessor('firstName', {
    header: 'First Name',
    size: 150,
  }),
  columnHelper.accessor('lastName', {
    header: 'Last Name',
    size: 150,
  }),
  columnHelper.accessor('age', {
    header: 'Age',
    size: 100,
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    size: 280,
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    size: 120,
    cell: (info) => {
      const status = info.getValue();
      return <span style={{ textTransform: 'capitalize' }}>{status}</span>;
    },
  }),
];

const meta: Meta<typeof VirtualTable<Person>> = {
  title: 'Components/VirtualTable',
  component: VirtualTable,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => {
    const data = useMemo(() => generatePeople(100), []);
    return (
      <div style={{ flex: 1, minHeight: 0 }}>
        <VirtualTable data={data} columns={columns} height="100%" />
      </div>
    );
  },
};

export const TenThousandRows: Story = {
  render: () => {
    const data = useMemo(() => generatePeople(10000), []);
    return (
      <div style={{ flex: 1, minHeight: 0 }}>
        <VirtualTable data={data} columns={columns} height="100%" />
      </div>
    );
  },
};

export const WithSorting: Story = {
  render: () => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const data = useMemo(() => generatePeople(1000), []);

    return (
      <div style={{ flex: 1, minHeight: 0 }}>
        <VirtualTable
          data={data}
          columns={columns}
          height="100%"
          enableSorting
          sorting={sorting}
          onSortingChange={setSorting}
        />
      </div>
    );
  },
};

export const WithRowSelection: Story = {
  render: () => {
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const data = useMemo(() => generatePeople(100), []);

    const selectionColumns = [
      columnHelper.display({
        id: 'select',
        size: 50,
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
      }),
      ...columns,
    ];

    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 8 }}>Selected: {Object.keys(rowSelection).length} rows</div>
        <VirtualTable
          data={data}
          columns={selectionColumns}
          height="100%"
          enableRowSelection
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          getRowId={(row) => String(row.id)}
        />
      </div>
    );
  },
};

export const InfiniteScroll: Story = {
  render: () => {
    const [data, setData] = useState(() => generatePeople(50));
    const [loading, setLoading] = useState(false);

    const loadMore = () => {
      if (loading) return;
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setData((prev) => [...prev, ...generatePeople(50)]);
        setLoading(false);
      }, 500);
    };

    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 8 }}>
          Loaded: {data.length} rows {loading && '(loading...)'}
        </div>
        <VirtualTable
          data={data}
          columns={columns}
          height="100%"
          onScrollToBottom={loadMore}
          scrollBottomThreshold={200}
        />
      </div>
    );
  },
};

export const CustomStyling: Story = {
  render: () => {
    const data = useMemo(() => generatePeople(100), []);

    return (
      <div style={{ flex: 1, minHeight: 0 }}>
        <style>{`
          .custom-table {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
          }
          .custom-table table {
            border-collapse: collapse;
          }
          .custom-table th {
            background: #f7fafc;
            padding: 12px 8px;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid #e2e8f0;
          }
          .custom-table td {
            padding: 8px;
            border-bottom: 1px solid #e2e8f0;
          }
          .custom-table tr:hover td {
            background: #f7fafc;
          }
        `}</style>
        <VirtualTable data={data} columns={columns} height="100%" className="custom-table" />
      </div>
    );
  },
};

export const WithRowExpansion: Story = {
  render: () => {
    const [expanded, setExpanded] = useState<ExpandedState>({});
    const data = useMemo(() => generatePeople(100), []);

    const expandColumns = [
      columnHelper.display({
        id: 'expand',
        size: 50,
        header: () => null,
        cell: ({ row }) => (
          <span style={{ cursor: 'pointer' }}>{row.getIsExpanded() ? '▼' : '▶'}</span>
        ),
      }),
      ...columns,
    ];

    const renderExpandedRow = (row: Row<Person>) => (
      <div
        style={{
          padding: '16px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
        }}
      >
        <h4 style={{ margin: '0 0 8px 0' }}>
          Details for {row.original.firstName} {row.original.lastName}
        </h4>
        <p style={{ margin: '4px 0' }}>
          <strong>Email:</strong> {row.original.email}
        </p>
        <p style={{ margin: '4px 0' }}>
          <strong>Age:</strong> {row.original.age}
        </p>
        <p style={{ margin: '4px 0' }}>
          <strong>Status:</strong> {row.original.status}
        </p>
        <p style={{ margin: '4px 0', color: '#64748b' }}>
          This expanded content can contain any React component — forms, charts, nested tables, etc.
        </p>
      </div>
    );

    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 8 }}>
          Click a row to expand. Expanded: {Object.keys(expanded).length}
        </div>
        <style>{`
          .expand-table th, .expand-table td {
            padding: 12px 8px;
            text-align: left;
          }
          .expand-table th {
            background: #f1f5f9;
            font-weight: 600;
            border-bottom: 2px solid #e2e8f0;
          }
          .expand-table tr[data-expanded="true"] > div:first-child {
            background: #eff6ff;
          }
          .expand-table tr:hover > div:first-child {
            background: #f8fafc;
          }
          .expand-table tr[data-expanded="true"]:hover > div:first-child {
            background: #eff6ff;
          }
        `}</style>
        <VirtualTable
          data={data}
          columns={expandColumns}
          height="100%"
          enableRowExpansion
          expanded={expanded}
          onExpandedChange={setExpanded}
          expandedRowHeight={150}
          renderExpandedRow={renderExpandedRow}
          getRowId={(row) => String(row.id)}
          className="expand-table"
        />
      </div>
    );
  },
};

export const RowExpansionWithSelection: Story = {
  render: () => {
    const [expanded, setExpanded] = useState<ExpandedState>({});
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const data = useMemo(() => generatePeople(100), []);

    const combinedColumns = [
      columnHelper.display({
        id: 'select',
        size: 50,
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onClick={(e) => e.stopPropagation()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
      }),
      columnHelper.display({
        id: 'expand',
        size: 50,
        cell: ({ row }) => (
          <span style={{ cursor: 'pointer' }}>{row.getIsExpanded() ? '▼' : '▶'}</span>
        ),
      }),
      ...columns,
    ];

    const renderExpandedRow = (row: Row<Person>) => (
      <div
        style={{
          padding: '16px',
          background: '#f0fdf4',
          borderTop: '1px solid #bbf7d0',
        }}
      >
        <p>
          <strong>Full profile for {row.original.firstName}:</strong>
        </p>
        <pre style={{ background: '#fff', padding: 8, borderRadius: 4 }}>
          {JSON.stringify(row.original, null, 2)}
        </pre>
      </div>
    );

    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 8 }}>
          Selected: {Object.keys(rowSelection).length} | Expanded: {Object.keys(expanded).length}
        </div>
        <VirtualTable
          data={data}
          columns={combinedColumns}
          height="100%"
          enableRowExpansion
          expanded={expanded}
          onExpandedChange={setExpanded}
          enableRowSelection
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          expandedRowHeight={200}
          renderExpandedRow={renderExpandedRow}
          getRowId={(row) => String(row.id)}
        />
      </div>
    );
  },
};

export const WithColumnResizing: Story = {
  render: () => {
    const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
    const data = useMemo(() => generatePeople(100), []);

    // Columns need enableResizing: true (default) or explicit size
    const resizableColumns = [
      columnHelper.accessor('id', {
        header: 'ID',
        size: 80,
        minSize: 50,
        maxSize: 150,
      }),
      columnHelper.accessor('firstName', {
        header: 'First Name',
        size: 120,
        minSize: 80,
        maxSize: 300,
      }),
      columnHelper.accessor('lastName', {
        header: 'Last Name',
        size: 120,
        minSize: 80,
        maxSize: 300,
      }),
      columnHelper.accessor('age', {
        header: 'Age',
        size: 80,
        minSize: 50,
        maxSize: 120,
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        size: 200,
        minSize: 100,
        maxSize: 400,
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        size: 100,
        minSize: 80,
        maxSize: 200,
        cell: (info) => {
          const status = info.getValue();
          return <span style={{ textTransform: 'capitalize' }}>{status}</span>;
        },
      }),
    ];

    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 8 }}>
          Drag column borders to resize. Current widths:{' '}
          {Object.entries(columnSizing)
            .map(([col, size]) => `${col}: ${size}px`)
            .join(', ') || 'default'}
        </div>
        <style>{`
          .resize-table th {
            background: #f1f5f9;
            padding: 12px 8px;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid #e2e8f0;
            border-right: 1px solid #e2e8f0;
          }
          .resize-table td {
            padding: 8px;
            border-bottom: 1px solid #e2e8f0;
            border-right: 1px solid #f1f5f9;
          }
          .resize-table .virtual-table-resizer {
            background: #cbd5e1;
            opacity: 0;
            transition: opacity 0.15s;
          }
          .resize-table th:hover .virtual-table-resizer {
            opacity: 1;
          }
          .resize-table .virtual-table-resizer[data-resizing] {
            background: #3b82f6;
            opacity: 1;
          }
        `}</style>
        <VirtualTable
          data={data}
          columns={resizableColumns}
          height="100%"
          enableColumnResizing
          columnResizeMode="onChange"
          columnSizing={columnSizing}
          onColumnSizingChange={setColumnSizing}
          className="resize-table"
        />
      </div>
    );
  },
};

export const WithColumnReordering: Story = {
  render: () => {
    const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([
      'id',
      'firstName',
      'lastName',
      'age',
      'email',
      'status',
    ]);
    const data = useMemo(() => generatePeople(100), []);

    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 8 }}>
          Drag column headers to reorder. Current order: {columnOrder.join(' → ')}
        </div>
        <style>{`
          .reorder-table th {
            background: #f1f5f9;
            padding: 12px 8px;
            text-align: left;
            font-weight: 600;
            border: 1px solid #e2e8f0;
            user-select: none;
          }
          .reorder-table th:hover {
            background: #e2e8f0;
          }
          .reorder-table th[data-dragging] {
            background: #dbeafe;
          }
          .reorder-table td {
            padding: 8px;
            border-bottom: 1px solid #e2e8f0;
          }
        `}</style>
        <VirtualTable
          data={data}
          columns={columns}
          height="100%"
          enableColumnReordering
          columnOrder={columnOrder}
          onColumnOrderChange={setColumnOrder}
          className="reorder-table"
        />
      </div>
    );
  },
};

export const WithMultiSort: Story = {
  render: () => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const data = useMemo(() => generatePeople(500), []);

    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 8 }}>
          <strong>Multi-sort:</strong> Hold Shift and click columns to add sort levels.
          {sorting.length > 0 && (
            <span style={{ marginLeft: 8 }}>
              Sorted by: {sorting.map((s) => `${s.id} (${s.desc ? 'desc' : 'asc'})`).join(' → ')}
            </span>
          )}
        </div>
        <style>{`
          .multisort-table th {
            background: #f8fafc;
            padding: 12px 8px;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid #e2e8f0;
            cursor: pointer;
          }
          .multisort-table th:hover {
            background: #f1f5f9;
          }
          .multisort-table td {
            padding: 8px;
            border-bottom: 1px solid #e2e8f0;
          }
        `}</style>
        <VirtualTable
          data={data}
          columns={columns}
          height="100%"
          enableSorting
          enableMultiSort
          maxMultiSortColCount={3}
          sorting={sorting}
          onSortingChange={setSorting}
          className="multisort-table"
        />
      </div>
    );
  },
};

export const WithKeyboardNavigation: Story = {
  render: () => {
    const [focusedRowIndex, setFocusedRowIndex] = useState<number>(-1);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [expanded, setExpanded] = useState<ExpandedState>({});
    const data = useMemo(() => generatePeople(100), []);

    const keyboardColumns = [
      columnHelper.display({
        id: 'select',
        size: 50,
        header: () => null,
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={() => {}}
            onClick={(e) => e.stopPropagation()}
          />
        ),
      }),
      columnHelper.display({
        id: 'expand',
        size: 50,
        cell: ({ row }) => <span>{row.getIsExpanded() ? '▼' : '▶'}</span>,
      }),
      ...columns,
    ];

    const renderExpandedRow = (row: Row<Person>) => (
      <div style={{ padding: 16, background: '#f0fdf4' }}>
        <strong>Details for {row.original.firstName}</strong>
        <p>Email: {row.original.email}</p>
      </div>
    );

    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 8 }}>
          <strong>Keyboard Navigation:</strong> Click table to focus, then use:
          <br />
          <code>↑/↓</code> Navigate rows | <code>Space</code> Toggle select | <code>Enter</code>{' '}
          Toggle expand | <code>Home/End</code> Jump to start/end
        </div>
        <div style={{ marginBottom: 8, fontSize: 12, color: '#666' }}>
          Focused row: {focusedRowIndex >= 0 ? focusedRowIndex : 'none'} | Selected:{' '}
          {Object.keys(rowSelection).length} | Expanded: {Object.keys(expanded).length}
        </div>
        <style>{`
          .keyboard-table:focus {
            outline: 2px solid #3b82f6;
            outline-offset: -2px;
          }
          .keyboard-table th {
            background: #f8fafc;
            padding: 12px 8px;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid #e2e8f0;
          }
          .keyboard-table td {
            padding: 8px;
            border-bottom: 1px solid #e2e8f0;
          }
          .keyboard-table tr[data-focused] > div:first-child {
            background: #dbeafe;
            outline: 2px solid #3b82f6;
            outline-offset: -2px;
          }
        `}</style>
        <VirtualTable
          data={data}
          columns={keyboardColumns}
          height="100%"
          enableKeyboardNavigation
          focusedRowIndex={focusedRowIndex}
          onFocusedRowChange={setFocusedRowIndex}
          enableRowSelection
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          enableRowExpansion
          expanded={expanded}
          onExpandedChange={setExpanded}
          expandedRowHeight={80}
          renderExpandedRow={renderExpandedRow}
          getRowId={(row) => String(row.id)}
          className="keyboard-table"
        />
      </div>
    );
  },
};

export const KitchenSink: Story = {
  render: () => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [expanded, setExpanded] = useState<ExpandedState>({});
    const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
    const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([
      'select',
      'expand',
      'id',
      'firstName',
      'lastName',
      'age',
      'email',
      'status',
    ]);
    const [focusedRowIndex, setFocusedRowIndex] = useState<number>(-1);
    const data = useMemo(() => generatePeople(1000), []);

    const allFeaturesColumns = [
      columnHelper.display({
        id: 'select',
        size: 50,
        enableResizing: false,
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onClick={(e) => e.stopPropagation()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
      }),
      columnHelper.display({
        id: 'expand',
        size: 50,
        enableResizing: false,
        cell: ({ row }) => (
          <span style={{ cursor: 'pointer' }}>{row.getIsExpanded() ? '▼' : '▶'}</span>
        ),
      }),
      columnHelper.accessor('id', {
        header: 'ID',
        size: 80,
        minSize: 50,
      }),
      columnHelper.accessor('firstName', {
        header: 'First Name',
        size: 120,
        minSize: 80,
      }),
      columnHelper.accessor('lastName', {
        header: 'Last Name',
        size: 120,
        minSize: 80,
      }),
      columnHelper.accessor('age', {
        header: 'Age',
        size: 80,
        minSize: 50,
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        size: 200,
        minSize: 100,
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        size: 100,
        minSize: 80,
        cell: (info) => {
          const status = info.getValue();
          const colors = { active: '#22c55e', inactive: '#ef4444', pending: '#f59e0b' };
          return (
            <span style={{ color: colors[status], textTransform: 'capitalize' }}>{status}</span>
          );
        },
      }),
    ];

    const renderExpandedRow = (row: Row<Person>) => (
      <div
        style={{
          padding: '16px',
          background: '#fafafa',
          borderTop: '1px solid #e5e5e5',
        }}
      >
        <strong>
          {row.original.firstName} {row.original.lastName}
        </strong>
        <p style={{ margin: '8px 0 0', color: '#666' }}>
          Email: {row.original.email} | Age: {row.original.age} | Status: {row.original.status}
        </p>
      </div>
    );

    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 8, fontSize: 14 }}>
          <strong>All features enabled:</strong> Sorting • Multi-sort • Selection • Expansion •
          Column Resizing • Column Reordering • Keyboard Navigation • Virtualization (1000 rows)
        </div>
        <div style={{ marginBottom: 8, fontSize: 12, color: '#666' }}>
          Selected: {Object.keys(rowSelection).length} | Expanded: {Object.keys(expanded).length} |
          Sorted by: {sorting.map((s) => `${s.id} ${s.desc ? '↓' : '↑'}`).join(', ') || 'none'} |
          Focused: {focusedRowIndex >= 0 ? focusedRowIndex : 'none'}
        </div>
        <div style={{ marginBottom: 8, fontSize: 11, color: '#999' }}>
          <code>↑/↓</code> Navigate | <code>Space</code> Select | <code>Enter</code> Expand |{' '}
          <code>Shift+Click</code> Multi-sort | Drag headers to reorder
        </div>
        <style>{`
          .kitchen-sink:focus {
            outline: 2px solid #3b82f6;
            outline-offset: -2px;
          }
          .kitchen-sink th {
            background: #1e293b;
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-weight: 600;
            cursor: grab;
          }
          .kitchen-sink th:hover {
            background: #334155;
          }
          .kitchen-sink th[data-dragging] {
            opacity: 0.5;
          }
          .kitchen-sink td {
            padding: 8px;
            border-bottom: 1px solid #e2e8f0;
          }
          .kitchen-sink tr[data-expanded="true"] > div:first-child {
            background: #f0f9ff;
          }
          .kitchen-sink tr[data-focused] > div:first-child {
            background: #dbeafe;
            outline: 2px solid #3b82f6;
            outline-offset: -2px;
          }
          .kitchen-sink .virtual-table-resizer {
            background: #475569;
          }
          .kitchen-sink .virtual-table-resizer[data-resizing] {
            background: #3b82f6;
          }
        `}</style>
        <VirtualTable
          data={data}
          columns={allFeaturesColumns}
          height="100%"
          enableSorting
          enableMultiSort
          maxMultiSortColCount={3}
          sorting={sorting}
          onSortingChange={setSorting}
          enableRowSelection
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          enableRowExpansion
          expanded={expanded}
          onExpandedChange={setExpanded}
          expandedRowHeight={80}
          renderExpandedRow={renderExpandedRow}
          enableColumnResizing
          columnSizing={columnSizing}
          onColumnSizingChange={setColumnSizing}
          enableColumnReordering
          columnOrder={columnOrder}
          onColumnOrderChange={setColumnOrder}
          enableKeyboardNavigation
          focusedRowIndex={focusedRowIndex}
          onFocusedRowChange={setFocusedRowIndex}
          getRowId={(row) => String(row.id)}
          className="kitchen-sink"
        />
      </div>
    );
  },
};
