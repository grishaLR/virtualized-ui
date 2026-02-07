import { useState, useCallback } from 'react';
import { useVirtualList } from 'virtualized-ui';

interface Article {
  id: string;
  headline: string;
  source: string;
  summary: string;
  time: string;
}

const sources = ['Reuters', 'AP News', 'Bloomberg', 'The Guardian', 'NPR'];
const topics = ['Technology', 'Science', 'Business', 'Health', 'World'];

const generateArticles = (start: number, count: number): Article[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `article-${start + i}`,
    headline: `${topics[(start + i) % 5]}: Major Development in ${['AI Research', 'Climate Policy', 'Global Markets', 'Space Exploration', 'Public Health'][(start + i) % 5]}`,
    source: sources[(start + i) % 5],
    summary: `A comprehensive report detailing significant progress and new findings that could reshape the future of ${topics[(start + i) % 5].toLowerCase()}.`,
    time: `${Math.floor(((start + i) * 37) % 24)}h ago`,
  }));

/** News feed — bold headlines, serif fonts */
export function ListInfiniteScrollDemo() {
  const [data, setData] = useState(() => generateArticles(0, 30));
  const [loading, setLoading] = useState(false);

  const loadMore = useCallback(() => {
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      setData((prev) => [...prev, ...generateArticles(prev.length, 20)]);
      setLoading(false);
    }, 600);
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
    estimatedItemHeight: 120,
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
          background: '#fffdf7',
          borderRadius: 4,
          border: '1px solid #e8e4db',
        }}
      >
        <div style={{ height: totalSize, position: 'relative' }}>
          {virtualItems.map((vi) => {
            const article = listData[vi.index];
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
                    padding: '16px 20px',
                    borderBottom: '1px solid #e8e4db',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f8f5ed')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#b91c1c',
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.05em',
                      }}
                    >
                      {article.source}
                    </span>
                    <span style={{ fontSize: 12, color: '#a8a29e' }}>·</span>
                    <span style={{ fontSize: 12, color: '#a8a29e' }}>{article.time}</span>
                  </div>
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: '#1c1917',
                      fontFamily: 'Georgia, "Times New Roman", serif',
                      lineHeight: 1.3,
                      margin: 0,
                    }}
                  >
                    {article.headline}
                  </h3>
                  <p
                    style={{
                      fontSize: 14,
                      color: '#78716c',
                      fontFamily: 'Georgia, "Times New Roman", serif',
                      lineHeight: 1.5,
                      marginTop: 6,
                    }}
                  >
                    {article.summary}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        {loading && (
          <div style={{ padding: 16, textAlign: 'center', fontSize: 13, color: '#a8a29e' }}>
            Loading more stories...
          </div>
        )}
      </div>
      <p style={{ fontSize: 12, color: '#a8a29e', marginTop: 8 }}>
        {data.length} articles loaded · Scroll to load more
      </p>
    </div>
  );
}
