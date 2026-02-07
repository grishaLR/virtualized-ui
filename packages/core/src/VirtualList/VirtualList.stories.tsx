import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { VirtualList } from './VirtualList';
import type { VirtualListRenderItemProps } from './types';

// --- Mock data types & generators ---

interface ListItem {
  id: string;
  title: string;
  body: string;
}

function generateItems(count: number, startId = 0): ListItem[] {
  const titles = [
    'Breaking: New discovery changes everything',
    'How to build better software',
    'Today I learned something amazing',
    'Thread on distributed systems',
    'Hot take: tabs vs spaces',
    'Announcing our new open source project',
    'A short reflection',
    'Why I switched to Rust',
    'My experience at the conference',
    'Quick tip for React developers',
  ];

  const bodies = [
    'This is a short post.',
    'Here is a medium-length post that contains a bit more detail about the topic at hand and gives some additional context.',
    'This is a longer post.\n\nIt has multiple paragraphs and goes into much more detail about the subject matter. The author clearly spent some time thinking about this one.\n\nThere are several key points to consider here.',
    'Just a quick thought I wanted to share with everyone.',
    'A detailed analysis follows below. First, we need to consider the historical context. Then we can look at the current state of affairs. Finally, we should think about what the future holds for all of us in this space.\n\nThe implications are quite significant when you think about it carefully.',
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `item-${startId + i}`,
    title: titles[(startId + i) % titles.length],
    body: bodies[(startId + i) % bodies.length],
  }));
}

// --- Social feed types ---

interface Post {
  id: string;
  author: string;
  handle: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  reposts: number;
  replies: number;
}

function generatePosts(count: number, startId = 0): Post[] {
  const authors = [
    { name: 'Alice Chen', handle: '@alice.bsky.social', avatar: 'AC' },
    { name: 'Bob Martinez', handle: '@bobm.bsky.social', avatar: 'BM' },
    { name: 'Carol Davis', handle: '@carol.bsky.social', avatar: 'CD' },
    { name: 'Dan Wilson', handle: '@danw.bsky.social', avatar: 'DW' },
    { name: 'Eva Brown', handle: '@eva.bsky.social', avatar: 'EB' },
    { name: 'Frank Lee', handle: '@frank.bsky.social', avatar: 'FL' },
  ];

  const contents = [
    'Just deployed a new feature to production. Feeling great about this one! 🚀',
    'Has anyone tried the new Bluesky API? The AT Protocol is really well designed.',
    'Hot take: TypeScript is the best thing that happened to JavaScript.\n\nI know this is controversial but hear me out...',
    'Working on a new open source project. Will share more details soon!',
    'The weather is perfect today. Taking a break from coding to enjoy the sunshine. ☀️',
    'Thread: 10 things I wish I knew when I started programming\n\n1. Read the docs\n2. Write tests\n3. Ask for help\n4. Take breaks\n5. Learn git properly',
    'Just finished reading "Designing Data-Intensive Applications". Highly recommend it to anyone working with distributed systems.',
    'Pro tip: Use `console.table()` instead of `console.log()` for arrays and objects. Game changer.',
    'Spent 3 hours debugging only to find a missing semicolon. Classic.',
    'Excited to announce that our team just crossed 1 million users! Thank you all for the support.',
    "The best code is the code you don't have to write. Keep it simple.",
    "Looking for recommendations: What's the best React state management library in 2025?",
  ];

  const timeAgo = ['2m', '5m', '12m', '23m', '45m', '1h', '2h', '3h', '5h', '8h', '12h', '1d'];

  return Array.from({ length: count }, (_, i) => {
    const author = authors[(startId + i) % authors.length];
    return {
      id: `post-${startId + i}`,
      author: author.name,
      handle: author.handle,
      avatar: author.avatar,
      content: contents[(startId + i) % contents.length],
      timestamp: timeAgo[(startId + i) % timeAgo.length],
      likes: Math.floor(Math.random() * 500),
      reposts: Math.floor(Math.random() * 100),
      replies: Math.floor(Math.random() * 50),
    };
  });
}

// --- Story meta ---

const meta: Meta<typeof VirtualList> = {
  title: 'Components/VirtualList',
  component: VirtualList,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// --- Stories ---

export const Basic: Story = {
  render: () => {
    const data = useMemo(() => generateItems(200), []);

    return (
      <div style={{ flex: 1, minHeight: 0 }}>
        <style>{`
          .basic-list [role="listitem"] {
            padding: 12px 16px;
            border-bottom: 1px solid #e2e8f0;
          }
          .basic-list [role="listitem"]:hover {
            background: #f8fafc;
          }
          .basic-list .item-title {
            font-weight: 600;
            margin-bottom: 4px;
          }
          .basic-list .item-body {
            color: #64748b;
            font-size: 14px;
            white-space: pre-wrap;
          }
        `}</style>
        <VirtualList
          data={data}
          getItemId={(item) => item.id}
          renderItem={({ item }: VirtualListRenderItemProps<ListItem>) => (
            <div>
              <div className="item-title">{item.title}</div>
              <div className="item-body">{item.body}</div>
            </div>
          )}
          estimatedItemHeight={80}
          height="100%"
          className="basic-list"
        />
      </div>
    );
  },
};

export const InfiniteScroll: Story = {
  render: () => {
    const [data, setData] = useState(() => generateItems(30));
    const [loading, setLoading] = useState(false);

    const loadMore = useCallback(() => {
      if (loading) return;
      setLoading(true);
      setTimeout(() => {
        setData((prev) => [...prev, ...generateItems(30, prev.length)]);
        setLoading(false);
      }, 500);
    }, [loading]);

    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 8 }}>
          Loaded: {data.length} items {loading && '(loading more...)'}
        </div>
        <style>{`
          .infinite-list [role="listitem"] {
            padding: 12px 16px;
            border-bottom: 1px solid #e2e8f0;
          }
          .infinite-list .item-title {
            font-weight: 600;
            margin-bottom: 4px;
          }
          .infinite-list .item-body {
            color: #64748b;
            font-size: 14px;
            white-space: pre-wrap;
          }
        `}</style>
        <VirtualList
          data={data}
          getItemId={(item) => item.id}
          renderItem={({ item }: VirtualListRenderItemProps<ListItem>) => (
            <div>
              <div className="item-title">{item.title}</div>
              <div className="item-body">{item.body}</div>
            </div>
          )}
          estimatedItemHeight={80}
          height="100%"
          onScrollToBottom={loadMore}
          scrollBottomThreshold={200}
          className="infinite-list"
        />
      </div>
    );
  },
};

export const WithKeyboardNavigation: Story = {
  render: () => {
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const data = useMemo(() => generateItems(100), []);

    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 8 }}>
          <strong>Keyboard Navigation:</strong> Click list to focus, then use:
          <br />
          <code>↑/↓</code> Navigate items | <code>Home/End</code> Jump to start/end
        </div>
        <div style={{ marginBottom: 8, fontSize: 12, color: '#666' }}>
          Focused item: {focusedIndex >= 0 ? focusedIndex : 'none'}
        </div>
        <style>{`
          .keyboard-list:focus {
            outline: 2px solid #3b82f6;
            outline-offset: -2px;
          }
          .keyboard-list [role="listitem"] {
            padding: 12px 16px;
            border-bottom: 1px solid #e2e8f0;
          }
          .keyboard-list [role="listitem"][data-focused] {
            background: #dbeafe;
            outline: 2px solid #3b82f6;
            outline-offset: -2px;
          }
          .keyboard-list .item-title {
            font-weight: 600;
            margin-bottom: 4px;
          }
          .keyboard-list .item-body {
            color: #64748b;
            font-size: 14px;
            white-space: pre-wrap;
          }
        `}</style>
        <VirtualList
          data={data}
          getItemId={(item) => item.id}
          renderItem={({ item }: VirtualListRenderItemProps<ListItem>) => (
            <div>
              <div className="item-title">{item.title}</div>
              <div className="item-body">{item.body}</div>
            </div>
          )}
          estimatedItemHeight={80}
          height="100%"
          enableKeyboardNavigation
          focusedIndex={focusedIndex}
          onFocusedIndexChange={setFocusedIndex}
          className="keyboard-list"
        />
      </div>
    );
  },
};

export const LiveUpdates: Story = {
  render: () => {
    const [data, setData] = useState(() => generatePosts(20));
    const [paused, setPaused] = useState(false);
    const nextIdRef = useRef(20);

    useEffect(() => {
      if (paused) return;

      const interval = setInterval(() => {
        const count = Math.floor(Math.random() * 3) + 1; // 1-3 new posts
        const newPosts = generatePosts(count, nextIdRef.current);
        nextIdRef.current += count;
        setData((prev) => [...newPosts, ...prev]);
      }, 3000);

      return () => clearInterval(interval);
    }, [paused]);

    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span>
            <strong>Live Updates:</strong> {data.length} posts
          </span>
          <button
            onClick={() => setPaused((p) => !p)}
            style={{
              padding: '4px 12px',
              borderRadius: 4,
              border: '1px solid #cbd5e1',
              background: paused ? '#f0fdf4' : '#fef2f2',
              cursor: 'pointer',
            }}
          >
            {paused ? 'Resume' : 'Pause'}
          </button>
          <span style={{ fontSize: 12, color: '#666' }}>
            New posts prepend every 3s — scroll position stays anchored
          </span>
        </div>
        <style>{`
          .live-list [role="listitem"] {
            padding: 12px 16px;
            border-bottom: 1px solid #e2e8f0;
          }
          .live-list .post-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 6px;
          }
          .live-list .post-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: #3b82f6;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 600;
            flex-shrink: 0;
          }
          .live-list .post-author {
            font-weight: 600;
          }
          .live-list .post-handle {
            color: #94a3b8;
            font-size: 13px;
          }
          .live-list .post-time {
            color: #94a3b8;
            font-size: 13px;
            margin-left: auto;
          }
          .live-list .post-content {
            white-space: pre-wrap;
            font-size: 14px;
            line-height: 1.5;
            margin-left: 44px;
          }
          .live-list .post-actions {
            display: flex;
            gap: 24px;
            margin-top: 8px;
            margin-left: 44px;
            color: #94a3b8;
            font-size: 13px;
          }
        `}</style>
        <VirtualList
          data={data}
          getItemId={(item) => item.id}
          renderItem={({ item }: VirtualListRenderItemProps<Post>) => (
            <div>
              <div className="post-header">
                <div className="post-avatar">{item.avatar}</div>
                <div>
                  <span className="post-author">{item.author}</span>{' '}
                  <span className="post-handle">{item.handle}</span>
                </div>
                <span className="post-time">{item.timestamp}</span>
              </div>
              <div className="post-content">{item.content}</div>
              <div className="post-actions">
                <span>💬 {item.replies}</span>
                <span>🔁 {item.reposts}</span>
                <span>❤️ {item.likes}</span>
              </div>
            </div>
          )}
          estimatedItemHeight={120}
          height="100%"
          gap={0}
          className="live-list"
        />
      </div>
    );
  },
};

export const SocialFeed: Story = {
  render: () => {
    const [data, setData] = useState(() => generatePosts(30));
    const [loading, setLoading] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const [paused, setPaused] = useState(false);
    const nextIdRef = useRef(30);
    const appendIdRef = useRef(1000);

    // Live prepend
    useEffect(() => {
      if (paused) return;

      const interval = setInterval(() => {
        const count = Math.floor(Math.random() * 2) + 1;
        const newPosts = generatePosts(count, nextIdRef.current);
        nextIdRef.current += count;
        setData((prev) => [...newPosts, ...prev]);
      }, 4000);

      return () => clearInterval(interval);
    }, [paused]);

    // Infinite scroll
    const loadMore = useCallback(() => {
      if (loading) return;
      setLoading(true);
      setTimeout(() => {
        const morePosts = generatePosts(20, appendIdRef.current);
        appendIdRef.current += 20;
        setData((prev) => [...prev, ...morePosts]);
        setLoading(false);
      }, 500);
    }, [loading]);

    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 8 }}>
          <strong>Social Feed</strong> — {data.length} posts
          {loading && ' (loading more...)'}
          <button
            onClick={() => setPaused((p) => !p)}
            style={{
              marginLeft: 12,
              padding: '2px 8px',
              borderRadius: 4,
              border: '1px solid #cbd5e1',
              background: paused ? '#f0fdf4' : '#fef2f2',
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            {paused ? 'Resume live' : 'Pause live'}
          </button>
        </div>
        <div style={{ marginBottom: 8, fontSize: 12, color: '#666' }}>
          <code>↑/↓</code> Navigate | <code>Home/End</code> Jump | Scroll to bottom to load more |
          Focused: {focusedIndex >= 0 ? focusedIndex : 'none'}
        </div>
        <style>{`
          .social-feed:focus {
            outline: 2px solid #1d9bf0;
            outline-offset: -2px;
          }
          .social-feed [role="listitem"] {
            padding: 12px 16px;
            border-bottom: 1px solid #eff3f4;
            transition: background 0.15s;
          }
          .social-feed [role="listitem"]:hover {
            background: #f7f9fa;
          }
          .social-feed [role="listitem"][data-focused] {
            background: #e8f5fd;
            outline: 2px solid #1d9bf0;
            outline-offset: -2px;
          }
          .social-feed .post-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 6px;
          }
          .social-feed .post-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #1d9bf0;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            font-weight: 700;
            flex-shrink: 0;
          }
          .social-feed .post-author {
            font-weight: 700;
            font-size: 15px;
          }
          .social-feed .post-handle {
            color: #536471;
            font-size: 14px;
          }
          .social-feed .post-time {
            color: #536471;
            font-size: 14px;
            margin-left: auto;
          }
          .social-feed .post-content {
            white-space: pre-wrap;
            font-size: 15px;
            line-height: 1.5;
            margin-left: 48px;
          }
          .social-feed .post-actions {
            display: flex;
            gap: 32px;
            margin-top: 10px;
            margin-left: 48px;
            color: #536471;
            font-size: 13px;
          }
          .social-feed .post-actions span {
            cursor: pointer;
          }
          .social-feed .post-actions span:hover {
            color: #1d9bf0;
          }
        `}</style>
        <VirtualList
          data={data}
          getItemId={(item) => item.id}
          renderItem={({ item }: VirtualListRenderItemProps<Post>) => (
            <div>
              <div className="post-header">
                <div className="post-avatar">{item.avatar}</div>
                <div>
                  <span className="post-author">{item.author}</span>{' '}
                  <span className="post-handle">{item.handle}</span>
                </div>
                <span className="post-time">{item.timestamp}</span>
              </div>
              <div className="post-content">{item.content}</div>
              <div className="post-actions">
                <span>💬 {item.replies}</span>
                <span>🔁 {item.reposts}</span>
                <span>❤️ {item.likes}</span>
              </div>
            </div>
          )}
          estimatedItemHeight={120}
          height="100%"
          gap={0}
          enableKeyboardNavigation
          focusedIndex={focusedIndex}
          onFocusedIndexChange={setFocusedIndex}
          onScrollToBottom={loadMore}
          scrollBottomThreshold={200}
          className="social-feed"
          ariaLabel="Social feed"
        />
      </div>
    );
  },
};
