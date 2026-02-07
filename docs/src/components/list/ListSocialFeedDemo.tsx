import { useState, useCallback } from 'react';
import { useVirtualList } from 'virtualized-ui';

interface Post {
  id: string;
  author: string;
  handle: string;
  content: string;
  likes: number;
  replies: number;
  reposts: number;
  time: string;
}

const authors = [
  { name: 'Alice Johnson', handle: 'alice.dev' },
  { name: 'Bob Smith', handle: 'bobcodes' },
  { name: 'Carol White', handle: 'carol.design' },
  { name: 'Dan Brown', handle: 'danbrown42' },
  { name: 'Eve Davis', handle: 'evedavis.io' },
];

const contents = [
  'Just released a new open-source library for virtualized lists. Check it out!',
  'Hot take: headless UI libraries are the future. Give me hooks over components any day.',
  'Spent the weekend refactoring our table component. 10x faster now with virtualization.',
  'Anyone else excited about the new React features? The composition patterns are great.',
  'Pro tip: always virtualize lists with more than 100 items. Your users will thank you.',
  'Working on keyboard navigation for our design system. Accessibility matters!',
  'The key to good DX is making the simple things simple and the hard things possible.',
  'Shipped dark mode today. It only took 3 months and 47 PRs.',
];

const generatePosts = (start: number, count: number): Post[] =>
  Array.from({ length: count }, (_, i) => {
    const idx = start + i;
    const author = authors[idx % 5];
    return {
      id: `post-${idx}`,
      author: author.name,
      handle: author.handle,
      content: contents[idx % contents.length],
      likes: Math.floor(Math.random() * 200),
      replies: Math.floor(Math.random() * 30),
      reposts: Math.floor(Math.random() * 50),
      time: `${Math.floor(idx * 0.5) + 1}m`,
    };
  });

const avatarColors = ['#1d4ed8', '#7c3aed', '#db2777', '#c2410c', '#0891b2'];

/** Bluesky-style — blue accent, avatar circles, action buttons */
export function ListSocialFeedDemo() {
  const [data, setData] = useState(() => generatePosts(0, 40));
  const [loading, setLoading] = useState(false);

  const loadMore = useCallback(() => {
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      setData((prev) => [...prev, ...generatePosts(prev.length, 20)]);
      setLoading(false);
    }, 500);
  }, [loading]);

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
    estimatedItemHeight: 140,
    onScrollToBottom: loadMore,
    scrollBottomThreshold: 300,
  });

  return (
    <div>
      <div
        ref={containerRef}
        className="overflow-auto"
        onScroll={handleScroll}
        style={{
          height: 500,
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #e5e7eb',
        }}
      >
        <div style={{ height: totalSize, position: 'relative' }}>
          {virtualItems.map((vi) => {
            const post = listData[vi.index];
            const authorIdx = authors.findIndex((a) => a.handle === post.handle);
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
                <div
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid #f3f4f6',
                    display: 'flex',
                    gap: 12,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: '50%',
                      background: color,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {post.author[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>
                        {post.author}
                      </span>
                      <span style={{ fontSize: 13, color: '#9ca3af' }}>@{post.handle}</span>
                      <span style={{ fontSize: 13, color: '#9ca3af' }}>· {post.time}</span>
                    </div>
                    <p
                      style={{ fontSize: 15, color: '#1f2937', lineHeight: 1.5, margin: '4px 0 0' }}
                    >
                      {post.content}
                    </p>
                    <div style={{ display: 'flex', gap: 24, marginTop: 10 }}>
                      {[
                        { icon: '💬', count: post.replies, label: 'Reply' },
                        { icon: '🔁', count: post.reposts, label: 'Repost' },
                        { icon: '❤️', count: post.likes, label: 'Like' },
                      ].map((action) => (
                        <button
                          key={action.label}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 13,
                            color: '#6b7280',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          <span>{action.icon}</span>
                          <span>{action.count}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {loading && (
          <div style={{ padding: 16, textAlign: 'center', fontSize: 13, color: '#9ca3af' }}>
            Loading more posts...
          </div>
        )}
      </div>
      <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>
        {data.length} posts · Scroll for more
      </p>
    </div>
  );
}
