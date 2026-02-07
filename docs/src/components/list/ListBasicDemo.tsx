import { useMemo } from 'react';
import { useVirtualList } from 'virtualized-ui';

interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
}

const generateItems = (count: number): Item[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `item-${i}`,
    title: `Item ${i + 1}`,
    description: `This is a description for item ${i + 1}. It contains some sample text to showcase the list.`,
    category: ['General', 'Updates', 'Notes', 'Tasks', 'Ideas'][i % 5],
  }));

/** Simple cards — rounded borders, light gray bg */
export function ListBasicDemo({ itemCount = 500 }: { itemCount?: number }) {
  const data = useMemo(() => generateItems(itemCount), [itemCount]);

  const {
    virtualItems,
    totalSize,
    containerRef,
    handleScroll,
    measureElement,
    data: listData,
  } = useVirtualList({
    data,
    getItemId: (item) => item.id,
    estimatedItemHeight: 88,
    gap: 8,
  });

  return (
    <div>
      <div
        ref={containerRef}
        className="overflow-auto"
        onScroll={handleScroll}
        style={{
          height: 500,
          padding: '8px 12px',
          background: '#f5f5f4',
          borderRadius: 8,
          border: '1px solid #e7e5e4',
        }}
      >
        <div style={{ height: totalSize, position: 'relative' }}>
          {virtualItems.map((vi) => {
            const item = listData[vi.index];
            return (
              <div
                key={vi.key}
                ref={measureElement}
                data-index={vi.index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${vi.start}px)`,
                }}
              >
                <div
                  style={{
                    background: '#fff',
                    borderRadius: 8,
                    border: '1px solid #e7e5e4',
                    padding: '12px 16px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#1c1917' }}>
                      {item.title}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: '#78716c',
                        background: '#f5f5f4',
                        padding: '2px 8px',
                        borderRadius: 12,
                      }}
                    >
                      {item.category}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: '#78716c', marginTop: 4, lineHeight: 1.4 }}>
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <p style={{ fontSize: 12, color: '#a8a29e', marginTop: 8 }}>
        {itemCount.toLocaleString()} items
      </p>
    </div>
  );
}
