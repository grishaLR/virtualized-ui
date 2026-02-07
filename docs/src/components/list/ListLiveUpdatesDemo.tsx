import { useState, useCallback, useEffect, useRef } from 'react';
import { useVirtualList } from 'virtualized-ui';

interface Message {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  avatar: string;
}

const authors = ['Alice', 'Bob', 'Carol', 'Dan', 'Eve'];
const avatarColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
const sampleTexts = [
  'Just shipped the new feature! 🚀',
  'Has anyone reviewed the latest PR?',
  'Great work on the redesign, looks amazing.',
  'Quick standup in 5 minutes.',
  'Found and fixed the memory leak.',
  'Can we discuss the API changes?',
  'The tests are all passing now ✅',
  'I pushed the updated docs.',
];

let msgCounter = 0;

const createMessage = (): Message => {
  const idx = msgCounter++;
  const authorIdx = idx % 5;
  const now = new Date();
  return {
    id: `msg-${idx}-${Date.now()}`,
    author: authors[authorIdx],
    text: sampleTexts[idx % sampleTexts.length],
    timestamp: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`,
    avatar: authors[authorIdx][0],
  };
};

const initialMessages = Array.from({ length: 30 }, () => createMessage());

/** Chat/timeline — avatars, message bubbles, timestamps */
export function ListLiveUpdatesDemo() {
  const [data, setData] = useState<Message[]>(initialMessages);
  const [autoAdd, setAutoAdd] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addMessage = useCallback(() => {
    setData((prev) => [createMessage(), ...prev]);
  }, []);

  useEffect(() => {
    if (autoAdd) {
      intervalRef.current = setInterval(addMessage, 1500);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoAdd, addMessage]);

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
    estimatedItemHeight: 72,
    gap: 4,
  });

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button
          onClick={addMessage}
          style={{
            padding: '6px 14px',
            fontSize: 13,
            borderRadius: 6,
            border: '1px solid #e5e7eb',
            background: '#fff',
            cursor: 'pointer',
            color: '#374151',
          }}
        >
          + Add Message
        </button>
        <button
          onClick={() => setAutoAdd((a) => !a)}
          style={{
            padding: '6px 14px',
            fontSize: 13,
            borderRadius: 6,
            border: '1px solid #e5e7eb',
            background: autoAdd ? '#dcfce7' : '#fff',
            cursor: 'pointer',
            color: autoAdd ? '#166534' : '#374151',
          }}
        >
          {autoAdd ? '⏸ Stop Auto' : '▶ Auto Add'}
        </button>
      </div>
      <div
        ref={containerRef}
        className="overflow-auto"
        onScroll={handleScroll}
        style={{
          height: 500,
          background: '#f9fafb',
          borderRadius: 12,
          border: '1px solid #e5e7eb',
          padding: '8px 12px',
        }}
      >
        <div style={{ height: totalSize, position: 'relative' }}>
          {virtualItems.map((vi) => {
            const msg = listData[vi.index];
            const authorIdx = authors.indexOf(msg.author);
            const color = avatarColors[authorIdx >= 0 ? authorIdx : 0];
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
                <div style={{ display: 'flex', gap: 10, padding: '6px 0' }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: color,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {msg.avatar}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
                        {msg.author}
                      </span>
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>{msg.timestamp}</span>
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        color: '#374151',
                        marginTop: 2,
                        background: '#fff',
                        padding: '8px 12px',
                        borderRadius: '4px 12px 12px 12px',
                        border: '1px solid #e5e7eb',
                        display: 'inline-block',
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>
        {data.length} messages · New messages prepend with scroll anchoring
      </p>
    </div>
  );
}
