import { useVirtualList } from './useVirtualList';
import type { VirtualListProps } from './types';

const DEFAULT_HEIGHT = 400;

export function VirtualList<TData>(props: VirtualListProps<TData>) {
  const {
    renderItem,
    height = DEFAULT_HEIGHT,
    className,
    style,
    ariaLabel,
    enableKeyboardNavigation,
    ...hookOptions
  } = props;

  const {
    virtualItems,
    totalSize,
    containerRef,
    handleScroll,
    handleKeyDown,
    focusedIndex,
    measureElement,
    data,
  } = useVirtualList({ ...hookOptions, enableKeyboardNavigation });

  return (
    <div
      ref={containerRef}
      role="list"
      aria-label={ariaLabel}
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
      <div style={{ height: totalSize, position: 'relative' }}>
        {virtualItems.map((vi) => {
          const item = data[vi.index];
          const isFocused = enableKeyboardNavigation === true && vi.index === focusedIndex;

          return (
            <div
              key={vi.key}
              ref={measureElement}
              data-index={vi.index}
              role="listitem"
              data-focused={isFocused || undefined}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${vi.start}px)`,
              }}
            >
              {renderItem({ item, index: vi.index, isFocused })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
