import type { Virtualizer, VirtualItem } from '@tanstack/react-virtual';
import type { ComponentType, ReactNode, RefObject } from 'react';

// ---------------------------------------------------------------------------
// Option helpers
// ---------------------------------------------------------------------------

export interface OptionGroup<TOption> {
  label: string;
  options: TOption[];
}

export type OptionsOrGroups<TOption> = TOption[] | OptionGroup<TOption>[];

// ---------------------------------------------------------------------------
// Async config
// ---------------------------------------------------------------------------

export interface AsyncConfig<TOption> {
  /** Fetch options matching the search string */
  loadOptions: (inputValue: string) => Promise<OptionsOrGroups<TOption>>;
  /** Debounce delay in ms (default 300) */
  debounceMs?: number;
  /** Whether to call loadOptions when the menu opens (default true) */
  loadOnOpen?: boolean;
  /** How long cached results stay valid in ms (0 = no cache) */
  cacheTtlMs?: number;
}

// ---------------------------------------------------------------------------
// Cascade config
// ---------------------------------------------------------------------------

export interface CascadeConfig<TOption> {
  /** Return child options for a given parent. null means no children. */
  getChildren: (option: TOption) => TOption[] | Promise<TOption[]> | null;
  /** Optional quick check — avoids calling getChildren just to test existence */
  hasChildren?: (option: TOption) => boolean;
}

// ---------------------------------------------------------------------------
// Internal flattened item
// ---------------------------------------------------------------------------

export interface FlattenedItem<TOption> {
  type: 'option' | 'group-header';
  option?: TOption;
  groupLabel?: string;
  key: string;
  disabled: boolean;
}

// ---------------------------------------------------------------------------
// Sub-menu state
// ---------------------------------------------------------------------------

export interface SubMenuState<TOption> {
  parentOption: TOption;
  parentValue: string;
  options: TOption[];
  depth: number;
  isLoading: boolean;
  focusedIndex: number;
}

// ---------------------------------------------------------------------------
// Component slot props
// ---------------------------------------------------------------------------

export interface TriggerSlotProps {
  isOpen: boolean;
  disabled: boolean;
  placeholder: string;
  searchable: boolean;
  searchValue: string;
  multiple: boolean;
  selectedLabels: string[];
  onClick: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  ariaProps: Record<string, string | boolean | undefined>;
}

export interface MenuListSlotProps {
  menuRef: RefObject<HTMLDivElement | null>;
  virtualItems: VirtualItem[];
  totalSize: number;
  measureElement: (node: Element | null) => void;
  renderItem: (virtualItem: VirtualItem) => ReactNode;
  ariaProps: Record<string, string | boolean | undefined>;
}

export interface OptionSlotProps<TOption> {
  item: FlattenedItem<TOption>;
  option: TOption;
  label: string;
  value: string;
  isSelected: boolean;
  isFocused: boolean;
  isDisabled: boolean;
  hasCascade: boolean;
  onClick: () => void;
  ariaProps: Record<string, string | boolean | undefined>;
  dataAttributes: Record<string, string | boolean | undefined>;
}

export interface GroupHeaderSlotProps {
  label: string;
}

export interface TagSlotProps {
  label: string;
  value: string;
  onRemove: () => void;
}

export interface NoOptionsSlotProps {
  searchValue: string;
}

export interface LoadingSlotProps {}

export interface SubMenuSlotProps<TOption> {
  subMenu: SubMenuState<TOption>;
  getOptionLabel: (option: TOption) => string;
  getOptionValue: (option: TOption) => string;
  onSelect: (value: string) => void;
  onHover: (index: number) => void;
  onOpenChild: (option: TOption) => void;
}

export interface ClearIndicatorSlotProps {
  onClick: () => void;
}

export interface DropdownIndicatorSlotProps {
  isOpen: boolean;
}

export interface InputSlotProps {
  value: string;
  onChange: (value: string) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  ariaProps: Record<string, string | boolean | undefined>;
}

// ---------------------------------------------------------------------------
// Component slots map
// ---------------------------------------------------------------------------

export interface VirtualSelectComponents<TOption> {
  Trigger?: ComponentType<TriggerSlotProps>;
  MenuList?: ComponentType<MenuListSlotProps>;
  Option?: ComponentType<OptionSlotProps<TOption>>;
  GroupHeader?: ComponentType<GroupHeaderSlotProps>;
  Tag?: ComponentType<TagSlotProps>;
  NoOptions?: ComponentType<NoOptionsSlotProps>;
  Loading?: ComponentType<LoadingSlotProps>;
  SubMenu?: ComponentType<SubMenuSlotProps<TOption>>;
  ClearIndicator?: ComponentType<ClearIndicatorSlotProps>;
  DropdownIndicator?: ComponentType<DropdownIndicatorSlotProps>;
  Input?: ComponentType<InputSlotProps>;
}

// ---------------------------------------------------------------------------
// Hook options & return
// ---------------------------------------------------------------------------

export interface UseVirtualSelectOptions<TOption> {
  // Data
  /** Static options (ignored when async is provided) */
  options?: OptionsOrGroups<TOption>;
  /** Extract unique string ID from an option */
  getOptionValue: (option: TOption) => string;
  /** Extract display text from an option */
  getOptionLabel: (option: TOption) => string;
  /** Check if an option is disabled */
  isOptionDisabled?: (option: TOption) => boolean;

  // Selection
  /** Enable multi-select */
  multiple?: boolean;
  /** Controlled selected value(s) */
  value?: string[];
  /** Initial value for uncontrolled mode */
  defaultValue?: string[];
  /** Called when selection changes */
  onValueChange?: (values: string[]) => void;

  // Search
  /** Enable search input */
  searchable?: boolean;
  /** Controlled search value */
  searchValue?: string;
  /** Called when search text changes */
  onSearchChange?: (value: string) => void;
  /** Custom filter function (return true to include) */
  filterOption?: (option: TOption, inputValue: string) => boolean;

  // Open state
  /** Controlled open state */
  isOpen?: boolean;
  /** Initial open state for uncontrolled mode */
  defaultIsOpen?: boolean;
  /** Called when open state changes */
  onOpenChange?: (isOpen: boolean) => void;

  // Focus
  /** Controlled focused index */
  focusedIndex?: number;
  /** Called when focused index changes */
  onFocusedIndexChange?: (index: number) => void;

  // Async
  /** Async options loading config */
  async?: AsyncConfig<TOption>;

  // Cascade
  /** Cascade sub-menus config */
  cascade?: CascadeConfig<TOption>;

  // Virtualization
  /** Estimated option row height in pixels (default 36) */
  estimatedOptionHeight?: number;
  /** Number of items to render outside visible area (default 5) */
  overscan?: number;

  // Behavior
  /** Close menu after selecting (default: true for single, false for multi) */
  closeOnSelect?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Disable the entire select */
  disabled?: boolean;
  /** Clear search text after selecting an option (default true) */
  clearSearchOnSelect?: boolean;
}

export interface UseVirtualSelectReturn<TOption> {
  // Virtualizer
  virtualizer: Virtualizer<HTMLDivElement, Element>;
  virtualItems: VirtualItem[];
  totalSize: number;
  menuRef: RefObject<HTMLDivElement | null>;
  measureElement: (node: Element | null) => void;

  // Data
  flattenedItems: FlattenedItem<TOption>[];

  // State
  isOpen: boolean;
  searchValue: string;
  focusedIndex: number;
  selectedValues: string[];
  selectedOptions: TOption[];
  isLoading: boolean;

  // Sub-menus
  subMenus: SubMenuState<TOption>[];

  // Actions
  open: () => void;
  close: () => void;
  toggle: () => void;
  setSearch: (value: string) => void;
  selectValue: (value: string) => void;
  deselectValue: (value: string) => void;
  toggleValue: (value: string) => void;
  clearAll: () => void;
  setFocusedIndex: (index: number) => void;
  openSubMenu: (option: TOption) => void;
  closeSubMenus: () => void;

  // Event handlers
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handleMenuKeyDown: (e: React.KeyboardEvent) => void;
  handleSearchInput: (value: string) => void;

  // Refs
  containerRef: RefObject<HTMLDivElement | null>;
  triggerRef: RefObject<HTMLButtonElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;

  // ARIA helpers
  getTriggerProps: () => Record<string, string | boolean | undefined>;
  getMenuProps: () => Record<string, string | boolean | undefined>;
  getOptionProps: (index: number) => Record<string, string | boolean | undefined>;
  getInputProps: () => Record<string, string | boolean | undefined>;

  // Resolved options
  getOptionByValue: (value: string) => TOption | undefined;
}

// ---------------------------------------------------------------------------
// Component props
// ---------------------------------------------------------------------------

export interface VirtualSelectProps<TOption> extends UseVirtualSelectOptions<TOption> {
  /** Custom component overrides */
  components?: VirtualSelectComponents<TOption>;
  /** Height of the dropdown menu (CSS value) */
  menuHeight?: number | string;
  /** Class name for the root container */
  className?: string;
  /** Style for the root container */
  style?: React.CSSProperties;
}
