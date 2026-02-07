import { useRef, useCallback, useState, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { UseVirtualListOptions, UseVirtualListReturn } from './types';

const DEFAULT_ESTIMATED_ITEM_HEIGHT = 100;
const DEFAULT_OVERSCAN = 5;
const DEFAULT_SCROLL_THRESHOLD = 100;

export function useVirtualList<TData>(
  options: UseVirtualListOptions<TData>
): UseVirtualListReturn<TData> {
  const {
    data,
    getItemId,
    estimatedItemHeight = DEFAULT_ESTIMATED_ITEM_HEIGHT,
    overscan = DEFAULT_OVERSCAN,
    gap = 0,
    enableKeyboardNavigation = false,
    focusedIndex: controlledFocusedIndex,
    onFocusedIndexChange,
    onScrollToBottom,
    scrollBottomThreshold = DEFAULT_SCROLL_THRESHOLD,
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);

  // Internal state for uncontrolled mode
  const [internalFocusedIndex, setInternalFocusedIndex] = useState<number>(-1);

  // Use controlled or internal state
  const focusedIndex = controlledFocusedIndex ?? internalFocusedIndex;

  // Prepend scroll anchoring
  const prevFirstItemIdRef = useRef<string | null>(null);
  const prevDataLengthRef = useRef<number>(data.length);

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => estimatedItemHeight,
    overscan,
    gap,
    getItemKey: (index) => getItemId(data[index], index),
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  // Prepend detection and scroll anchoring
  useEffect(() => {
    const prevFirstId = prevFirstItemIdRef.current;
    const prevLength = prevDataLengthRef.current;

    if (data.length > 0) {
      const currentFirstId = getItemId(data[0], 0);

      // Detect prepend: first item ID changed AND data grew
      if (prevFirstId !== null && currentFirstId !== prevFirstId && data.length > prevLength) {
        const oldFirstIndex = data.findIndex((item, i) => getItemId(item, i) === prevFirstId);

        if (oldFirstIndex > 0 && containerRef.current) {
          const prependedCount = oldFirstIndex;
          containerRef.current.scrollTop += prependedCount * (estimatedItemHeight + gap);
        }
      }

      prevFirstItemIdRef.current = currentFirstId;
    } else {
      prevFirstItemIdRef.current = null;
    }

    prevDataLengthRef.current = data.length;
  }, [data, getItemId, estimatedItemHeight, gap]);

  // Handle scroll to bottom detection
  const handleScroll = useCallback(() => {
    if (!onScrollToBottom || !containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    if (distanceFromBottom < scrollBottomThreshold) {
      onScrollToBottom();
    }
  }, [onScrollToBottom, scrollBottomThreshold]);

  // Focus item change handler
  const setFocusedItem = useCallback(
    (index: number) => {
      const clampedIndex = Math.max(-1, Math.min(index, data.length - 1));
      if (onFocusedIndexChange) {
        onFocusedIndexChange(clampedIndex);
      } else {
        setInternalFocusedIndex(clampedIndex);
      }
      // Scroll focused item into view
      if (clampedIndex >= 0) {
        virtualizer.scrollToIndex(clampedIndex, { align: 'auto' });
      }
    },
    [data.length, onFocusedIndexChange, virtualizer]
  );

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!enableKeyboardNavigation) return;

      const currentIndex = focusedIndex;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedItem(currentIndex + 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedItem(currentIndex - 1);
          break;
        case 'Home':
          e.preventDefault();
          setFocusedItem(0);
          break;
        case 'End':
          e.preventDefault();
          setFocusedItem(data.length - 1);
          break;
      }
    },
    [enableKeyboardNavigation, focusedIndex, data.length, setFocusedItem]
  );

  // Convenience methods
  const scrollToIndex = useCallback(
    (index: number) => {
      virtualizer.scrollToIndex(index, { align: 'auto' });
    },
    [virtualizer]
  );

  const scrollToTop = useCallback(() => {
    virtualizer.scrollToIndex(0, { align: 'start' });
  }, [virtualizer]);

  const measureElement = useCallback(
    (node: Element | null) => {
      if (node) {
        virtualizer.measureElement(node);
      }
    },
    [virtualizer]
  );

  return {
    virtualizer,
    virtualItems,
    totalSize,
    containerRef,
    handleScroll,
    handleKeyDown,
    setFocusedItem,
    focusedIndex,
    scrollToIndex,
    scrollToTop,
    measureElement,
    data,
  };
}
