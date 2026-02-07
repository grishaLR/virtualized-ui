# virtualized-ui

Headless virtualized table and list primitives for React. Built on [TanStack Table](https://tanstack.com/table) and [TanStack Virtual](https://tanstack.com/virtual).

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

- **Virtualization** - Efficiently render thousands of rows/items
- **Headless** - You control the markup and styles
- **Tables** - Sorting, selection, expansion, resizing, reordering
- **Lists** - Dynamic heights, keyboard nav, scroll anchoring
- **Keyboard Navigation** - Arrow keys, Home/End, Space/Enter
- **Infinite Scroll** - Load more data on scroll
- **Controlled & Uncontrolled** - Flexible state management

## Quick Start

### VirtualTable

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

### VirtualList

```tsx
import { useVirtualList } from 'virtualized-ui';

interface Item {
  id: string;
  title: string;
}

function MyList({ items }: { items: Item[] }) {
  const {
    virtualItems,
    totalSize,
    containerRef,
    measureElement,
    data,
  } = useVirtualList({
    data: items,
    getItemId: (item) => item.id,
    estimatedItemHeight: 60,
  });

  return (
    <div ref={containerRef} style={{ height: 400, overflow: 'auto' }}>
      <div style={{ height: totalSize, position: 'relative' }}>
        {virtualItems.map((vi) => (
          <div
            key={vi.key}
            ref={measureElement}
            data-index={vi.index}
            style={{
              position: 'absolute',
              top: 0,
              width: '100%',
              transform: `translateY(${vi.start}px)`,
            }}
          >
            {data[vi.index].title}
          </div>
        ))}
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

### `useVirtualList<TData>(options)`

A hook for virtualized flat lists with dynamic item heights and scroll anchoring.

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `data` | `TData[]` | required | The data array |
| `getItemId` | `(item, index) => string` | required | Stable unique ID per item |
| `estimatedItemHeight` | `number` | `100` | Estimated height per item |
| `overscan` | `number` | `5` | Items to render outside viewport |
| `gap` | `number` | `0` | Gap between items in pixels |
| `enableKeyboardNavigation` | `boolean` | `false` | Enable keyboard navigation |
| `focusedIndex` | `number` | - | Controlled focused index |
| `onFocusedIndexChange` | `(index) => void` | - | Focus change callback |
| `onScrollToBottom` | `() => void` | - | Called when scrolled near bottom |
| `scrollBottomThreshold` | `number` | `100` | Pixels from bottom to trigger callback |

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `virtualizer` | `Virtualizer` | TanStack Virtual instance |
| `virtualItems` | `VirtualItem[]` | Currently visible virtual items |
| `totalSize` | `number` | Total scrollable height |
| `containerRef` | `RefObject<HTMLDivElement>` | Ref for scroll container |
| `handleScroll` | `() => void` | Scroll handler for infinite scroll |
| `handleKeyDown` | `(e) => void` | Keyboard event handler |
| `setFocusedItem` | `(index) => void` | Set focused item index |
| `focusedIndex` | `number` | Currently focused item |
| `scrollToIndex` | `(index) => void` | Scroll to specific index |
| `scrollToTop` | `() => void` | Scroll to top |
| `measureElement` | `(node) => void` | Ref callback for dynamic sizing |
| `data` | `TData[]` | The data array |

## Documentation

Full documentation and interactive demos at [virtualized-ui.dev](https://virtualized-ui.dev).

## License

MIT
