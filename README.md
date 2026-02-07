# virtualized-ui

Headless virtualized table, list, and select components for React.

## Features

- 🚀 **Virtualized** — Render thousands of rows/items without performance issues
- 🎨 **Headless** — Logic and structure only, you control the styles
- 📦 **Tiny** — Only ships what you use
- 🔧 **Flexible** — Use the component or the hook for full control
- ⚡ **TanStack Powered** — Built on TanStack Table and TanStack Virtual

## Installation

```bash
npm install virtualized-ui
# or
pnpm add virtualized-ui
# or
yarn add virtualized-ui
```

## Quick Start

### VirtualTable

```tsx
import { VirtualTable, createColumnHelper } from 'virtualized-ui';

interface Person {
  id: number;
  name: string;
  email: string;
}

const columnHelper = createColumnHelper<Person>();

const columns = [
  columnHelper.accessor('id', { header: 'ID', size: 80 }),
  columnHelper.accessor('name', { header: 'Name', size: 150 }),
  columnHelper.accessor('email', { header: 'Email', size: 200 }),
];

function App() {
  const data: Person[] = [/* your data */];

  return (
    <VirtualTable
      data={data}
      columns={columns}
      height={400}
    />
  );
}
```

### VirtualList

```tsx
import { VirtualList } from 'virtualized-ui';

interface Item {
  id: string;
  title: string;
}

function App() {
  const items: Item[] = [/* your data */];

  return (
    <VirtualList
      data={items}
      getItemId={(item) => item.id}
      height={400}
      renderItem={({ item }) => (
        <div style={{ padding: 12, borderBottom: '1px solid #eee' }}>
          {item.title}
        </div>
      )}
    />
  );
}
```

## Components

### VirtualTable

A virtualized table component with optional sorting, row selection, expansion, column resizing, reordering, and infinite scroll.

```tsx
<VirtualTable
  data={data}
  columns={columns}
  height={400}
  enableSorting
  enableRowSelection
  onScrollToBottom={() => loadMore()}
/>
```

### useVirtualTable

For full control, use the hook directly:

```tsx
import { useVirtualTable } from 'virtualized-ui';

function MyCustomTable() {
  const { rows, virtualItems, containerRef, totalSize } = useVirtualTable({
    data,
    columns,
  });

  // Build your own UI...
}
```

### VirtualList

A virtualized list component for rendering large flat datasets with dynamic item heights, keyboard navigation, and scroll anchoring.

```tsx
<VirtualList
  data={items}
  getItemId={(item) => item.id}
  height={400}
  estimatedItemHeight={60}
  enableKeyboardNavigation
  onScrollToBottom={() => loadMore()}
  renderItem={({ item, isFocused }) => (
    <div style={{ padding: 12, background: isFocused ? '#f0f0f0' : '#fff' }}>
      {item.title}
    </div>
  )}
/>
```

### useVirtualList

For full control over list rendering:

```tsx
import { useVirtualList } from 'virtualized-ui';

function MyCustomList() {
  const { virtualItems, totalSize, containerRef, measureElement, data } =
    useVirtualList({
      data: items,
      getItemId: (item) => item.id,
      estimatedItemHeight: 60,
    });

  // Build your own UI...
}
```

## VirtualTable Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `TData[]` | required | Array of data items |
| `columns` | `ColumnDef[]` | required | TanStack Table column definitions |
| `height` | `number \| string` | `400` | Container height |
| `rowHeight` | `number` | `40` | Estimated row height for virtualization |
| `overscan` | `number` | `5` | Rows to render outside visible area |
| `enableSorting` | `boolean` | `false` | Enable column sorting |
| `enableMultiSort` | `boolean` | `false` | Enable multi-column sorting |
| `enableRowSelection` | `boolean` | `false` | Enable row selection |
| `enableRowExpansion` | `boolean` | `false` | Enable row expansion |
| `enableKeyboardNavigation` | `boolean` | `false` | Enable keyboard navigation |
| `enableColumnResizing` | `boolean` | `false` | Enable column resizing |
| `enableColumnReordering` | `boolean` | `false` | Enable column reordering |
| `stickyHeader` | `boolean` | `true` | Sticky table header |
| `onScrollToBottom` | `() => void` | - | Called when scrolled to bottom |

## VirtualList Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `TData[]` | required | Array of data items |
| `getItemId` | `(item, index) => string` | required | Stable unique ID per item |
| `renderItem` | `(props) => ReactNode` | required | Render function for each item |
| `height` | `number \| string` | `400` | Container height |
| `estimatedItemHeight` | `number` | `100` | Estimated height per item |
| `overscan` | `number` | `5` | Items to render outside visible area |
| `gap` | `number` | `0` | Gap between items in pixels |
| `enableKeyboardNavigation` | `boolean` | `false` | Enable keyboard navigation |
| `onScrollToBottom` | `() => void` | - | Called when scrolled to bottom |
| `scrollBottomThreshold` | `number` | `100` | Distance from bottom to trigger callback |

## Styling

virtualized-ui renders semantic HTML with no default styles. Style it however you want:

```css
.my-table th {
  background: #f5f5f5;
  padding: 12px;
  text-align: left;
}

.my-table td {
  padding: 8px;
  border-bottom: 1px solid #eee;
}
```

## Documentation

Full documentation and interactive demos at [virtualized-ui.dev](https://virtualized-ui.dev).

## License

MIT
