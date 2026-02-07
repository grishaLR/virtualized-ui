import { useMemo } from 'react';
import { useVirtualList } from 'virtualized-ui';

interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  time: string;
  unread: boolean;
}

const senders = ['Alice Johnson', 'Bob Smith', 'Carol White', 'Dan Brown', 'Eve Davis'];
const subjects = [
  'Weekly Team Sync',
  'Project Update: Q4 Goals',
  'Meeting Notes - Monday',
  'New Design Review',
  'Budget Approval Needed',
];

const generateEmails = (count: number): Email[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `email-${i}`,
    from: senders[i % 5],
    subject: subjects[i % 5],
    preview: `Hey, just wanted to follow up on the discussion from earlier. Let me know if you have any questions about item #${i + 1}.`,
    time: `${9 + (i % 12)}:${String((i * 7) % 60).padStart(2, '0')} AM`,
    unread: i % 3 === 0,
  }));

const accentColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

/** Email client — left color bar on focus, compact */
export function ListKeyboardDemo({ itemCount = 200 }: { itemCount?: number }) {
  const data = useMemo(() => generateEmails(itemCount), [itemCount]);

  const {
    virtualItems,
    totalSize,
    containerRef,
    handleScroll,
    handleKeyDown,
    focusedIndex,
    measureElement,
    data: listData,
  } = useVirtualList({
    data,
    getItemId: (item) => item.id,
    estimatedItemHeight: 68,
    enableKeyboardNavigation: true,
  });

  return (
    <div>
      <div
        style={{
          fontSize: 12,
          color: '#64748b',
          marginBottom: 8,
        }}
      >
        {focusedIndex >= 0
          ? `Focused: ${listData[focusedIndex]?.from}`
          : 'Click list, then use ↑↓ arrows'}
      </div>
      <div
        ref={containerRef}
        className="overflow-auto focus:outline-none"
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        style={{
          height: 500,
          background: '#fff',
          borderRadius: 8,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ height: totalSize, position: 'relative' }}>
          {virtualItems.map((vi) => {
            const email = listData[vi.index];
            const isFocused = vi.index === focusedIndex;
            const accent = accentColors[vi.index % 5];
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
                    padding: '10px 16px 10px 12px',
                    borderBottom: '1px solid #f1f5f9',
                    borderLeft: isFocused ? `3px solid ${accent}` : '3px solid transparent',
                    background: isFocused ? '#f8fafc' : '#fff',
                    transition: 'background 0.1s, border-color 0.1s',
                    display: 'flex',
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: email.unread ? 700 : 400,
                          color: '#0f172a',
                        }}
                      >
                        {email.from}
                      </span>
                      <span style={{ fontSize: 12, color: '#94a3b8', flexShrink: 0 }}>
                        {email.time}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: email.unread ? 600 : 400,
                        color: '#334155',
                        marginTop: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {email.subject}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: '#94a3b8',
                        marginTop: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {email.preview}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>
        {itemCount} emails · ↑↓ navigate · Home/End jump
      </p>
    </div>
  );
}
