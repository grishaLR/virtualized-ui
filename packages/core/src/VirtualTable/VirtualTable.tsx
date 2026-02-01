import { useState } from 'react';
import { flexRender } from '@tanstack/react-table';
import { useVirtualTable } from './useVirtualTable';
import type { VirtualTableProps } from './types';

const DEFAULT_HEIGHT = 400;

export function VirtualTable<TData>(props: VirtualTableProps<TData>) {
  const {
    height = DEFAULT_HEIGHT,
    stickyHeader = true,
    renderExpandedRow,
    className,
    style,
    ...tableOptions
  } = props;

  const {
    rows,
    virtualizer,
    virtualItems,
    totalSize,
    containerRef,
    handleScroll,
    handleKeyDown,
    table,
    reorderColumn,
    setFocusedRow,
    focusedRowIndex,
  } = useVirtualTable(tableOptions);

  const headerGroups = table.getHeaderGroups();
  const enableRowExpansion = tableOptions.enableRowExpansion;
  const enableColumnResizing = tableOptions.enableColumnResizing;
  const enableColumnReordering = tableOptions.enableColumnReordering;
  const enableKeyboardNavigation = tableOptions.enableKeyboardNavigation;

  // Drag state for column reordering
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);

  return (
    <div
      ref={containerRef}
      className={className}
      tabIndex={enableKeyboardNavigation ? 0 : undefined}
      style={{
        height,
        overflow: 'auto',
        position: 'relative',
        outline: 'none',
        ...style,
      }}
      onScroll={handleScroll}
      onKeyDown={enableKeyboardNavigation ? handleKeyDown : undefined}
    >
      <table
        style={{
          display: 'grid',
          width: '100%',
        }}
      >
        <thead
          style={{
            display: 'grid',
            position: stickyHeader ? 'sticky' : 'relative',
            top: 0,
            zIndex: 1,
          }}
        >
          {headerGroups.map((headerGroup) => (
            <tr
              key={headerGroup.id}
              style={{
                display: 'flex',
                width: '100%',
              }}
            >
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  draggable={enableColumnReordering && !header.isPlaceholder}
                  data-dragging={draggedColumnId === header.column.id || undefined}
                  onDragStart={
                    enableColumnReordering
                      ? (e) => {
                          setDraggedColumnId(header.column.id);
                          e.dataTransfer.effectAllowed = 'move';
                        }
                      : undefined
                  }
                  onDragOver={
                    enableColumnReordering
                      ? (e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'move';
                        }
                      : undefined
                  }
                  onDrop={
                    enableColumnReordering
                      ? (e) => {
                          e.preventDefault();
                          if (draggedColumnId && draggedColumnId !== header.column.id) {
                            reorderColumn(draggedColumnId, header.column.id);
                          }
                        }
                      : undefined
                  }
                  onDragEnd={enableColumnReordering ? () => setDraggedColumnId(null) : undefined}
                  style={{
                    flex: `0 0 ${header.getSize()}px`,
                    cursor: enableColumnReordering
                      ? 'grab'
                      : header.column.getCanSort()
                        ? 'pointer'
                        : 'default',
                    position: 'relative',
                    opacity: draggedColumnId === header.column.id ? 0.5 : 1,
                  }}
                  onClick={
                    !enableColumnReordering ? header.column.getToggleSortingHandler() : undefined
                  }
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getIsSorted() === 'asc' && ' ↑'}
                  {header.column.getIsSorted() === 'desc' && ' ↓'}

                  {/* Column resize handle */}
                  {enableColumnResizing && header.column.getCanResize() && (
                    <div
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      onClick={(e) => e.stopPropagation()}
                      className="virtual-table-resizer"
                      data-resizing={header.column.getIsResizing() || undefined}
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        height: '100%',
                        width: '5px',
                        cursor: 'col-resize',
                        userSelect: 'none',
                        touchAction: 'none',
                        background: header.column.getIsResizing()
                          ? 'rgba(0, 0, 0, 0.5)'
                          : 'transparent',
                      }}
                    />
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody
          style={{
            display: 'grid',
            height: `${totalSize}px`,
            position: 'relative',
          }}
        >
          {virtualItems.map((virtualRow) => {
            const row = rows[virtualRow.index];
            const isExpanded = row.getIsExpanded();
            const canExpand = enableRowExpansion && row.getCanExpand();
            const isFocused = enableKeyboardNavigation && virtualRow.index === focusedRowIndex;

            const handleRowClick = () => {
              if (enableKeyboardNavigation) {
                setFocusedRow(virtualRow.index);
              }
              if (canExpand) {
                row.toggleExpanded();
              }
            };

            return (
              <tr
                key={row.id}
                data-index={virtualRow.index}
                data-expanded={isExpanded || undefined}
                data-focused={isFocused || undefined}
                ref={(node) => virtualizer.measureElement(node)}
                style={{
                  display: 'block',
                  position: 'absolute',
                  transform: `translateY(${virtualRow.start}px)`,
                  width: '100%',
                  cursor: canExpand || enableKeyboardNavigation ? 'pointer' : 'default',
                }}
                onClick={handleRowClick}
              >
                {/* Row cells */}
                <div
                  style={{
                    display: 'flex',
                    width: '100%',
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{
                        flex: `0 0 ${cell.column.getSize()}px`,
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </div>

                {/* Expanded content */}
                {isExpanded && renderExpandedRow && (
                  <div onClick={(e) => e.stopPropagation()} style={{ width: '100%' }}>
                    {renderExpandedRow(row)}
                  </div>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
