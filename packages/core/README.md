# virtualized-ui

Headless virtualized table primitives for React. Built on [TanStack Table](https://tanstack.com/table) and [TanStack Virtual](https://tanstack.com/virtual).

## Installation

```bash
npm install virtualized-ui
# or
pnpm add virtualized-ui
# or
yarn add virtualized-ui
```

**Peer dependencies:** React 18+

## Features

- **Virtualization** - Efficiently render thousands of rows
- **Sorting** - Single and multi-column sorting
- **Row Selection** - Checkbox or click-based selection
- **Row Expansion** - Expandable rows with variable heights
- **Column Resizing** - Drag to resize columns
- **Column Reordering** - Drag and drop columns
- **Keyboard Navigation** - Arrow keys, Home/End, Space/Enter
- **Infinite Scroll** - Load more data on scroll
- **Controlled & Uncontrolled** - Flexible state management

## Quick Start

```tsx
import { useVirtualTable } from 'virtualized-ui';
import { createColumnHelper } from '@tanstack/react-table';

interface Person {
  id: number;
  name: string;
  age: number;
}

const columnHelper = createColumnHelper<Person>();

const columns = [
  columnHelper.accessor('name', { header: 'Name' }),
  columnHelper.accessor('age', { header: 'Age' }),
];

function MyTable({ data }: { data: Person[] }) {
  const {
    table,
    rows,
    virtualItems,
    totalSize,
    containerRef,
  } = useVirtualTable({
    data,
    columns,
  });

  return (
    <div ref={containerRef} style={{ height: 400, overflow: 'auto' }}>
      <div style={{ height: totalSize, position: 'relative' }}>
        {virtualItems.map((virtualRow) => {
          const row = rows[virtualRow.index];
          return (
            <div
              key={row.id}
              style={{
                position: 'absolute',
                top: virtualRow.start,
                height: virtualRow.size,
              }}
            >
              {row.getVisibleCells().map((cell) => (
                <span key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </span>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

## API

### `useVirtualTable<TData>(options)`

The main hook that combines TanStack Table with TanStack Virtual.

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `data` | `TData[]` | required | The data array |
| `columns` | `ColumnDef<TData>[]` | required | Column definitions |
| `rowHeight` | `number` | `40` | Height of each row in pixels |
| `overscan` | `number` | `5` | Number of rows to render outside viewport |
| `enableRowSelection` | `boolean` | `false` | Enable row selection |
| `rowSelection` | `RowSelectionState` | - | Controlled selection state |
| `onRowSelectionChange` | `(state) => void` | - | Selection change callback |
| `enableSorting` | `boolean` | `false` | Enable column sorting |
| `enableMultiSort` | `boolean` | `false` | Enable multi-column sorting |
| `sorting` | `SortingState` | - | Controlled sorting state |
| `onSortingChange` | `(state) => void` | - | Sorting change callback |
| `enableRowExpansion` | `boolean` | `false` | Enable expandable rows |
| `expandedRowHeight` | `number` | `200` | Additional height for expanded rows |
| `expanded` | `ExpandedState` | - | Controlled expansion state |
| `onExpandedChange` | `(state) => void` | - | Expansion change callback |
| `enableColumnResizing` | `boolean` | `false` | Enable column resizing |
| `columnResizeMode` | `'onChange' \| 'onEnd'` | `'onChange'` | When to update sizes |
| `enableColumnReordering` | `boolean` | `false` | Enable column reordering |
| `enableKeyboardNavigation` | `boolean` | `false` | Enable keyboard navigation |
| `onScrollToBottom` | `() => void` | - | Called when scrolled near bottom |
| `scrollBottomThreshold` | `number` | `100` | Pixels from bottom to trigger callback |
| `getRowId` | `(row) => string` | - | Custom row ID function |

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `table` | `Table<TData>` | TanStack Table instance |
| `rows` | `Row<TData>[]` | Processed rows from table |
| `virtualizer` | `Virtualizer` | TanStack Virtual instance |
| `virtualItems` | `VirtualItem[]` | Currently visible virtual items |
| `totalSize` | `number` | Total scrollable height |
| `containerRef` | `RefObject<HTMLDivElement>` | Ref for scroll container |
| `handleScroll` | `() => void` | Scroll handler for infinite scroll |
| `handleKeyDown` | `(e) => void` | Keyboard event handler |
| `reorderColumn` | `(from, to) => void` | Reorder columns helper |
| `setFocusedRow` | `(index) => void` | Set focused row index |
| `rowSelection` | `RowSelectionState` | Current selection state |
| `sorting` | `SortingState` | Current sorting state |
| `expanded` | `ExpandedState` | Current expansion state |
| `columnSizing` | `ColumnSizingState` | Current column sizes |
| `columnOrder` | `ColumnOrderState` | Current column order |
| `focusedRowIndex` | `number` | Currently focused row |

## Examples

### With Row Expansion

```tsx
const { table, rows, virtualItems, totalSize, containerRef } = useVirtualTable({
  data,
  columns,
  enableRowExpansion: true,
  rowHeight: 52,
  expandedRowHeight: 200,
});
```

### With Infinite Scroll

```tsx
const { containerRef, handleScroll } = useVirtualTable({
  data,
  columns,
  onScrollToBottom: () => fetchNextPage(),
  scrollBottomThreshold: 500,
});

return (
  <div ref={containerRef} onScroll={handleScroll} style={{ height: 400, overflow: 'auto' }}>
    {/* ... */}
  </div>
);
```

### With Sorting

```tsx
const { table, sorting } = useVirtualTable({
  data,
  columns,
  enableSorting: true,
  enableMultiSort: true,
});

// In header:
<th onClick={header.column.getToggleSortingHandler()}>
  {header.column.columnDef.header}
  {header.column.getIsSorted() === 'asc' ? ' ↑' : header.column.getIsSorted() === 'desc' ? ' ↓' : ''}
</th>
```

## License

MIT
