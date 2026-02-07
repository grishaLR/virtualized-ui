# virtualized-ui

Headless virtualized table, list, and select primitives for React. Built on [TanStack Table](https://tanstack.com/table) and [TanStack Virtual](https://tanstack.com/virtual).

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
- **Select** - Single/multi select, searchable, grouped, async loading, cascade sub-menus
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

### VirtualSelect

```tsx
import { useVirtualSelect } from 'virtualized-ui';

interface Option {
  value: string;
  label: string;
}

function MySelect({ options }: { options: Option[] }) {
  const select = useVirtualSelect({
    options,
    getOptionValue: (o) => o.value,
    getOptionLabel: (o) => o.label,
    searchable: true,
    placeholder: 'Choose...',
  });

  return (
    <div ref={select.containerRef} onKeyDown={select.handleKeyDown}>
      <button ref={select.triggerRef} onClick={select.toggle}>
        {select.selectedOptions[0]?.label ?? 'Choose...'}
      </button>
      {select.isOpen && (
        <div ref={select.menuRef} style={{ maxHeight: 300, overflow: 'auto' }}>
          <div style={{ height: select.totalSize, position: 'relative' }}>
            {select.virtualItems.map((vi) => {
              const item = select.flattenedItems[vi.index];
              if (item.type !== 'option') return null;
              return (
                <div
                  key={vi.key}
                  ref={select.measureElement}
                  data-index={vi.index}
                  onClick={() => select.selectValue(item.option!.value)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    transform: `translateY(${vi.start}px)`,
                  }}
                >
                  {item.option!.label}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
```

Or use the `VirtualSelect` component with slot-based customization:

```tsx
import { VirtualSelect } from 'virtualized-ui';

<VirtualSelect
  options={options}
  getOptionValue={(o) => o.value}
  getOptionLabel={(o) => o.label}
  searchable
  placeholder="Choose..."
/>
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

### `useVirtualSelect<TOption>(options)`

A hook for virtualized select dropdowns with search, multi-select, grouped options, and async loading.

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `options` | `TOption[] \| OptionGroup<TOption>[]` | — | Static options (ignored when async is provided) |
| `getOptionValue` | `(option) => string` | required | Extract unique string ID from an option |
| `getOptionLabel` | `(option) => string` | required | Extract display text from an option |
| `isOptionDisabled` | `(option) => boolean` | — | Check if an option is disabled |
| `multiple` | `boolean` | `false` | Enable multi-select |
| `value` | `string[]` | — | Controlled selected values |
| `defaultValue` | `string[]` | `[]` | Initial value for uncontrolled mode |
| `onValueChange` | `(values) => void` | — | Called when selection changes |
| `searchable` | `boolean` | `false` | Enable search input |
| `searchValue` | `string` | — | Controlled search value |
| `onSearchChange` | `(value) => void` | — | Called when search text changes |
| `filterOption` | `(option, input) => boolean` | label includes input | Custom filter function |
| `isOpen` | `boolean` | — | Controlled open state |
| `onOpenChange` | `(isOpen) => void` | — | Called when open state changes |
| `async` | `AsyncConfig<TOption>` | — | Async options loading config |
| `cascade` | `CascadeConfig<TOption>` | — | Cascade sub-menus config |
| `estimatedOptionHeight` | `number` | `36` | Estimated option row height |
| `overscan` | `number` | `5` | Items to render outside viewport |
| `closeOnSelect` | `boolean` | `true` (single) / `false` (multi) | Close menu after selecting |
| `placeholder` | `string` | — | Placeholder text |
| `disabled` | `boolean` | `false` | Disable the entire select |

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `virtualizer` | `Virtualizer` | TanStack Virtual instance |
| `virtualItems` | `VirtualItem[]` | Currently visible virtual items |
| `totalSize` | `number` | Total scrollable height |
| `menuRef` | `RefObject<HTMLDivElement>` | Ref for menu scroll container |
| `measureElement` | `(node) => void` | Ref callback for dynamic sizing |
| `flattenedItems` | `FlattenedItem<TOption>[]` | Flattened items (options + group headers) |
| `isOpen` | `boolean` | Whether dropdown is open |
| `searchValue` | `string` | Current search text |
| `focusedIndex` | `number` | Currently focused option index |
| `selectedValues` | `string[]` | Array of selected value strings |
| `selectedOptions` | `TOption[]` | Array of selected option objects |
| `isLoading` | `boolean` | Whether async options are loading |
| `open` / `close` / `toggle` | `() => void` | Menu open/close actions |
| `selectValue` / `deselectValue` / `toggleValue` | `(value) => void` | Selection actions |
| `clearAll` | `() => void` | Clear all selected values |
| `openSubMenu` | `(option) => void` | Open cascade sub-menu for an option |
| `closeSubMenus` | `() => void` | Close all open sub-menus |
| `subMenus` | `SubMenuState<TOption>[]` | Currently open sub-menu states |
| `handleKeyDown` | `(e) => void` | Keyboard event handler for container |
| `handleMenuKeyDown` | `(e) => void` | Keyboard event handler for menu |
| `handleSearchInput` | `(value) => void` | Search input handler |
| `containerRef` | `RefObject<HTMLDivElement>` | Ref for root container |
| `triggerRef` | `RefObject<HTMLButtonElement>` | Ref for trigger button |
| `inputRef` | `RefObject<HTMLInputElement>` | Ref for search input |
| `getTriggerProps` / `getMenuProps` / `getOptionProps` / `getInputProps` | `() => Record<string, ...>` | ARIA prop helpers |

## Documentation

Full documentation and interactive demos at [virtualized-ui.dev](https://virtualized-ui.dev).

## License

MIT
