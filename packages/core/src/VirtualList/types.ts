import type { Virtualizer, VirtualItem } from '@tanstack/react-virtual';
import type { ReactNode, RefObject, CSSProperties } from 'react';

export interface VirtualListRenderItemProps<TData> {
  item: TData;
  index: number;
  isFocused: boolean;
}

export interface VirtualListProps<TData> {
  /** Array of data items to render */
  data: TData[];

  /** Render function for each item */
  renderItem: (props: VirtualListRenderItemProps<TData>) => ReactNode;

  /** Get a stable unique ID for each item (required for prepend detection) */
  getItemId: (item: TData, index: number) => string;

  /** Estimated height of each item in pixels */
  estimatedItemHeight?: number;

  /** Height of the list container (CSS value) */
  height?: number | string;

  /** Number of items to render outside visible area */
  overscan?: number;

  /** Gap between items in pixels */
  gap?: number;

  /** Enable keyboard navigation (ArrowUp/Down, Home/End) */
  enableKeyboardNavigation?: boolean;

  /** Controlled focused item index */
  focusedIndex?: number;

  /** Callback when focused item changes */
  onFocusedIndexChange?: (index: number) => void;

  /** Called when user scrolls near the bottom */
  onScrollToBottom?: () => void;

  /** Threshold in pixels before bottom to trigger onScrollToBottom */
  scrollBottomThreshold?: number;

  /** Class name for the container */
  className?: string;

  /** Style for the container */
  style?: CSSProperties;

  /** Accessible label for the list */
  ariaLabel?: string;
}

export interface UseVirtualListOptions<TData> extends Pick<
  VirtualListProps<TData>,
  | 'data'
  | 'getItemId'
  | 'estimatedItemHeight'
  | 'overscan'
  | 'gap'
  | 'enableKeyboardNavigation'
  | 'focusedIndex'
  | 'onFocusedIndexChange'
  | 'onScrollToBottom'
  | 'scrollBottomThreshold'
> {}

export interface UseVirtualListReturn<TData> {
  /** The virtualizer instance */
  virtualizer: Virtualizer<HTMLDivElement, Element>;

  /** Virtual items currently rendered */
  virtualItems: VirtualItem[];

  /** Total height of all items */
  totalSize: number;

  /** Ref for the scroll container */
  containerRef: RefObject<HTMLDivElement>;

  /** Scroll event handler */
  handleScroll: () => void;

  /** Keyboard event handler */
  handleKeyDown: (e: React.KeyboardEvent) => void;

  /** Set the focused item index */
  setFocusedItem: (index: number) => void;

  /** Current focused item index */
  focusedIndex: number;

  /** Scroll to a specific index */
  scrollToIndex: (index: number) => void;

  /** Scroll to the top of the list */
  scrollToTop: () => void;

  /** Ref callback for measuring elements — attach to each item wrapper */
  measureElement: (node: Element | null) => void;

  /** The data array */
  data: TData[];
}
