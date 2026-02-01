# virtualized-ui

Headless virtualized table and select components for React.

## Features

- 🚀 **Virtualized** — Render thousands of rows without performance issues
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

## Components

### VirtualTable

A virtualized table component with optional sorting, row selection, and infinite scroll.

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

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `TData[]` | required | Array of data items |
| `columns` | `ColumnDef[]` | required | TanStack Table column definitions |
| `height` | `number \| string` | `400` | Container height |
| `rowHeight` | `number` | `40` | Estimated row height for virtualization |
| `overscan` | `number` | `5` | Rows to render outside visible area |
| `enableSorting` | `boolean` | `false` | Enable column sorting |
| `enableRowSelection` | `boolean` | `false` | Enable row selection |
| `stickyHeader` | `boolean` | `true` | Sticky table header |
| `onScrollToBottom` | `() => void` | - | Called when scrolled to bottom |

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

## License

MIT
