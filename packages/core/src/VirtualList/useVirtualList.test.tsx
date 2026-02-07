import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVirtualList } from './useVirtualList';

interface TestItem {
  id: string;
  text: string;
}

const testData: TestItem[] = [
  { id: 'a', text: 'Item A' },
  { id: 'b', text: 'Item B' },
  { id: 'c', text: 'Item C' },
];

const getItemId = (item: TestItem) => item.id;

describe('useVirtualList', () => {
  describe('uncontrolled state', () => {
    it('focusedIndex starts at -1', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          data: testData,
          getItemId,
        })
      );

      expect(result.current.focusedIndex).toBe(-1);
    });

    it('updates focusedIndex via setFocusedItem', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          data: testData,
          getItemId,
          enableKeyboardNavigation: true,
        })
      );

      expect(result.current.focusedIndex).toBe(-1);

      act(() => {
        result.current.setFocusedItem(1);
      });

      expect(result.current.focusedIndex).toBe(1);
    });
  });

  describe('controlled state', () => {
    it('uses controlled focusedIndex', () => {
      const onFocusedIndexChange = vi.fn();
      const { result } = renderHook(() =>
        useVirtualList({
          data: testData,
          getItemId,
          enableKeyboardNavigation: true,
          focusedIndex: 0,
          onFocusedIndexChange,
        })
      );

      expect(result.current.focusedIndex).toBe(0);

      act(() => {
        result.current.setFocusedItem(2);
      });

      expect(onFocusedIndexChange).toHaveBeenCalledWith(2);
    });

    it('does not update internal state in controlled mode', () => {
      const onFocusedIndexChange = vi.fn();
      const { result } = renderHook(() =>
        useVirtualList({
          data: testData,
          getItemId,
          enableKeyboardNavigation: true,
          focusedIndex: 0,
          onFocusedIndexChange,
        })
      );

      act(() => {
        result.current.setFocusedItem(1);
      });

      // Still 0 because parent controls it
      expect(result.current.focusedIndex).toBe(0);
    });
  });

  describe('setFocusedItem', () => {
    it('clamps to valid range (upper)', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          data: testData,
          getItemId,
          enableKeyboardNavigation: true,
        })
      );

      act(() => {
        result.current.setFocusedItem(100);
      });

      expect(result.current.focusedIndex).toBe(2); // clamped to max index
    });

    it('clamps to valid range (lower)', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          data: testData,
          getItemId,
          enableKeyboardNavigation: true,
        })
      );

      act(() => {
        result.current.setFocusedItem(-10);
      });

      expect(result.current.focusedIndex).toBe(-1); // clamped to -1
    });

    it('calls onFocusedIndexChange with clamped value in controlled mode', () => {
      const onFocusedIndexChange = vi.fn();
      renderHook(() =>
        useVirtualList({
          data: testData,
          getItemId,
          enableKeyboardNavigation: true,
          focusedIndex: 0,
          onFocusedIndexChange,
        })
      );

      // We need to get the hook's setFocusedItem and call it
      // But since we already tested controlled mode above, let's verify clamping
      const { result } = renderHook(() =>
        useVirtualList({
          data: testData,
          getItemId,
          enableKeyboardNavigation: true,
          focusedIndex: 0,
          onFocusedIndexChange,
        })
      );

      act(() => {
        result.current.setFocusedItem(100);
      });

      expect(onFocusedIndexChange).toHaveBeenCalledWith(2); // clamped
    });
  });

  describe('keyboard navigation', () => {
    it('ArrowDown moves focus down', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          data: testData,
          getItemId,
          enableKeyboardNavigation: true,
        })
      );

      expect(result.current.focusedIndex).toBe(-1);

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
        result.current.handleKeyDown(event as unknown as React.KeyboardEvent);
      });

      expect(result.current.focusedIndex).toBe(0);

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
        result.current.handleKeyDown(event as unknown as React.KeyboardEvent);
      });

      expect(result.current.focusedIndex).toBe(1);
    });

    it('ArrowUp moves focus up', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          data: testData,
          getItemId,
          enableKeyboardNavigation: true,
        })
      );

      // Set to index 2 first
      act(() => {
        result.current.setFocusedItem(2);
      });

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
        result.current.handleKeyDown(event as unknown as React.KeyboardEvent);
      });

      expect(result.current.focusedIndex).toBe(1);
    });

    it('Home jumps to first item', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          data: testData,
          getItemId,
          enableKeyboardNavigation: true,
        })
      );

      act(() => {
        result.current.setFocusedItem(2);
      });

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'Home' });
        Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
        result.current.handleKeyDown(event as unknown as React.KeyboardEvent);
      });

      expect(result.current.focusedIndex).toBe(0);
    });

    it('End jumps to last item', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          data: testData,
          getItemId,
          enableKeyboardNavigation: true,
        })
      );

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'End' });
        Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
        result.current.handleKeyDown(event as unknown as React.KeyboardEvent);
      });

      expect(result.current.focusedIndex).toBe(2);
    });

    it('does nothing when keyboard navigation is disabled', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          data: testData,
          getItemId,
          enableKeyboardNavigation: false,
        })
      );

      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
        result.current.handleKeyDown(event as unknown as React.KeyboardEvent);
      });

      expect(result.current.focusedIndex).toBe(-1); // unchanged
    });
  });

  describe('virtualizer integration', () => {
    it('provides virtualizer instance', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          data: testData,
          getItemId,
        })
      );

      expect(result.current.virtualizer).toBeDefined();
      expect(result.current.virtualItems).toBeDefined();
      expect(result.current.totalSize).toBeGreaterThan(0);
    });

    it('respects custom estimatedItemHeight', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          data: testData,
          getItemId,
          estimatedItemHeight: 60,
        })
      );

      // Total size should be estimatedItemHeight * count (no gap)
      expect(result.current.totalSize).toBe(60 * 3);
    });

    it('includes gap in totalSize', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          data: testData,
          getItemId,
          estimatedItemHeight: 60,
          gap: 10,
        })
      );

      // Total size = (estimatedItemHeight * count) + (gap * (count - 1))
      expect(result.current.totalSize).toBe(60 * 3 + 10 * 2);
    });
  });

  describe('scroll to bottom', () => {
    it('fires callback when near bottom', () => {
      const onScrollToBottom = vi.fn();
      const { result } = renderHook(() =>
        useVirtualList({
          data: testData,
          getItemId,
          onScrollToBottom,
          scrollBottomThreshold: 100,
        })
      );

      // Mock the container ref
      const mockContainer = {
        scrollTop: 900,
        scrollHeight: 1000,
        clientHeight: 50,
      };
      Object.defineProperty(result.current.containerRef, 'current', {
        value: mockContainer,
        writable: true,
      });

      act(() => {
        result.current.handleScroll();
      });

      // distanceFromBottom = 1000 - 900 - 50 = 50, which is < 100
      expect(onScrollToBottom).toHaveBeenCalled();
    });

    it('does not fire callback when far from bottom', () => {
      const onScrollToBottom = vi.fn();
      const { result } = renderHook(() =>
        useVirtualList({
          data: testData,
          getItemId,
          onScrollToBottom,
          scrollBottomThreshold: 100,
        })
      );

      const mockContainer = {
        scrollTop: 0,
        scrollHeight: 1000,
        clientHeight: 50,
      };
      Object.defineProperty(result.current.containerRef, 'current', {
        value: mockContainer,
        writable: true,
      });

      act(() => {
        result.current.handleScroll();
      });

      // distanceFromBottom = 1000 - 0 - 50 = 950, which is > 100
      expect(onScrollToBottom).not.toHaveBeenCalled();
    });

    it('no-ops when onScrollToBottom is not provided', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          data: testData,
          getItemId,
        })
      );

      // Should not throw
      act(() => {
        result.current.handleScroll();
      });
    });
  });

  describe('prepend anchoring', () => {
    it('adjusts scrollTop on prepend', () => {
      const allItems: TestItem[] = [
        { id: 'a', text: 'Item A' },
        { id: 'b', text: 'Item B' },
        { id: 'c', text: 'Item C' },
      ];

      const { result, rerender } = renderHook(
        ({ data }: { data: TestItem[] }) =>
          useVirtualList({
            data,
            getItemId,
            estimatedItemHeight: 50,
            gap: 10,
          }),
        { initialProps: { data: allItems } }
      );

      // Mock the container's scrollTop
      const mockContainer = {
        scrollTop: 100,
        scrollHeight: 1000,
        clientHeight: 400,
      };
      Object.defineProperty(result.current.containerRef, 'current', {
        value: mockContainer,
        writable: true,
      });

      // Prepend 2 items
      const prependedData: TestItem[] = [
        { id: 'x', text: 'Prepended X' },
        { id: 'y', text: 'Prepended Y' },
        ...allItems,
      ];

      rerender({ data: prependedData });

      // scrollTop should have increased by 2 * (50 + 10) = 120
      expect(mockContainer.scrollTop).toBe(220);
    });

    it('does not adjust scrollTop on append', () => {
      const allItems: TestItem[] = [
        { id: 'a', text: 'Item A' },
        { id: 'b', text: 'Item B' },
      ];

      const { result, rerender } = renderHook(
        ({ data }: { data: TestItem[] }) =>
          useVirtualList({
            data,
            getItemId,
            estimatedItemHeight: 50,
          }),
        { initialProps: { data: allItems } }
      );

      const mockContainer = {
        scrollTop: 100,
        scrollHeight: 1000,
        clientHeight: 400,
      };
      Object.defineProperty(result.current.containerRef, 'current', {
        value: mockContainer,
        writable: true,
      });

      // Append items (first item unchanged)
      const appendedData: TestItem[] = [...allItems, { id: 'c', text: 'Item C' }];

      rerender({ data: appendedData });

      // scrollTop should remain unchanged
      expect(mockContainer.scrollTop).toBe(100);
    });

    it('does not adjust scrollTop on initial render', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          data: testData,
          getItemId,
          estimatedItemHeight: 50,
        })
      );

      // containerRef.current is null by default in jsdom, so no adjustment
      expect(result.current.containerRef.current).toBeNull();
    });
  });

  describe('convenience methods', () => {
    it('scrollToIndex delegates to virtualizer', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          data: testData,
          getItemId,
        })
      );

      const scrollToIndexSpy = vi.spyOn(result.current.virtualizer, 'scrollToIndex');

      act(() => {
        result.current.scrollToIndex(1);
      });

      expect(scrollToIndexSpy).toHaveBeenCalledWith(1, { align: 'auto' });
    });

    it('scrollToTop delegates to virtualizer', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          data: testData,
          getItemId,
        })
      );

      const scrollToIndexSpy = vi.spyOn(result.current.virtualizer, 'scrollToIndex');

      act(() => {
        result.current.scrollToTop();
      });

      expect(scrollToIndexSpy).toHaveBeenCalledWith(0, { align: 'start' });
    });
  });
});
