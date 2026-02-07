import { useRef, useCallback, useState, useEffect, useId, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type {
  UseVirtualSelectOptions,
  UseVirtualSelectReturn,
  FlattenedItem,
  OptionsOrGroups,
  OptionGroup,
  SubMenuState,
} from './types';

const DEFAULT_ESTIMATED_OPTION_HEIGHT = 36;
const DEFAULT_OVERSCAN = 5;
const DEFAULT_DEBOUNCE_MS = 300;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isGrouped<T>(opts: OptionsOrGroups<T>): opts is OptionGroup<T>[] {
  return opts.length > 0 && typeof (opts[0] as OptionGroup<T>).options !== 'undefined';
}

function flattenOptions<T>(
  opts: OptionsOrGroups<T>,
  getOptionValue: (o: T) => string,
  isOptionDisabled?: (o: T) => boolean
): FlattenedItem<T>[] {
  const items: FlattenedItem<T>[] = [];

  if (isGrouped(opts)) {
    for (const group of opts) {
      items.push({
        type: 'group-header',
        groupLabel: group.label,
        key: `group:${group.label}`,
        disabled: false,
      });
      for (const option of group.options) {
        items.push({
          type: 'option',
          option,
          key: `option:${getOptionValue(option)}`,
          disabled: isOptionDisabled?.(option) ?? false,
        });
      }
    }
  } else {
    for (const option of opts as T[]) {
      items.push({
        type: 'option',
        option,
        key: `option:${getOptionValue(option)}`,
        disabled: isOptionDisabled?.(option) ?? false,
      });
    }
  }

  return items;
}

function defaultFilter<T>(
  option: T,
  inputValue: string,
  getOptionLabel: (o: T) => string
): boolean {
  return getOptionLabel(option).toLowerCase().includes(inputValue.toLowerCase());
}

function filterOptionsOrGroups<T>(
  opts: OptionsOrGroups<T>,
  inputValue: string,
  getOptionLabel: (o: T) => string,
  filterOption?: (option: T, inputValue: string) => boolean
): OptionsOrGroups<T> {
  const filterFn = filterOption ?? ((o: T, v: string) => defaultFilter(o, v, getOptionLabel));

  if (!inputValue) return opts;

  if (isGrouped(opts)) {
    const filtered: OptionGroup<T>[] = [];
    for (const group of opts) {
      const groupOptions = group.options.filter((o) => filterFn(o, inputValue));
      if (groupOptions.length > 0) {
        filtered.push({ label: group.label, options: groupOptions });
      }
    }
    return filtered;
  }

  return (opts as T[]).filter((o) => filterFn(o, inputValue));
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useVirtualSelect<TOption>(
  options: UseVirtualSelectOptions<TOption>
): UseVirtualSelectReturn<TOption> {
  const {
    options: staticOptions = [],
    getOptionValue,
    getOptionLabel,
    isOptionDisabled,
    multiple = false,
    value: controlledValue,
    defaultValue = [],
    onValueChange,
    searchable = false,
    searchValue: controlledSearchValue,
    onSearchChange,
    filterOption,
    isOpen: controlledIsOpen,
    defaultIsOpen = false,
    onOpenChange,
    focusedIndex: controlledFocusedIndex,
    onFocusedIndexChange,
    async: asyncConfig,
    cascade: cascadeConfig,
    estimatedOptionHeight = DEFAULT_ESTIMATED_OPTION_HEIGHT,
    overscan = DEFAULT_OVERSCAN,
    closeOnSelect,
    disabled = false,
    clearSearchOnSelect = true,
  } = options;

  const instanceId = useId();

  // ---- refs ----
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ---- internal state (uncontrolled) ----
  const [internalValue, setInternalValue] = useState<string[]>(defaultValue);
  const [internalSearchValue, setInternalSearchValue] = useState('');
  const [internalIsOpen, setInternalIsOpen] = useState(defaultIsOpen);
  const [internalFocusedIndex, setInternalFocusedIndex] = useState(-1);

  // ---- async state ----
  const [asyncOptions, setAsyncOptions] = useState<OptionsOrGroups<TOption>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const loadIdRef = useRef(0);
  const cacheRef = useRef<Map<string, { data: OptionsOrGroups<TOption>; expiresAt: number }>>(
    new Map()
  );
  const optionsByValueRef = useRef<Map<string, TOption>>(new Map());
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // ---- sub-menus ----
  const [subMenus, setSubMenus] = useState<SubMenuState<TOption>[]>([]);

  // ---- resolved state ----
  const selectedValues = controlledValue ?? internalValue;
  const searchValue = controlledSearchValue ?? internalSearchValue;
  const isOpen = controlledIsOpen ?? internalIsOpen;
  const focusedIndex = controlledFocusedIndex ?? internalFocusedIndex;

  const shouldCloseOnSelect = closeOnSelect ?? !multiple;

  // ---- state setters ----
  const setSelectedValues = useCallback(
    (next: string[]) => {
      if (onValueChange) {
        onValueChange(next);
      } else {
        setInternalValue(next);
      }
    },
    [onValueChange]
  );

  const setSearchValue = useCallback(
    (next: string) => {
      if (onSearchChange) {
        onSearchChange(next);
      } else {
        setInternalSearchValue(next);
      }
    },
    [onSearchChange]
  );

  const setIsOpen = useCallback(
    (next: boolean) => {
      if (onOpenChange) {
        onOpenChange(next);
      } else {
        setInternalIsOpen(next);
      }
    },
    [onOpenChange]
  );

  const setFocusedIndex = useCallback(
    (index: number) => {
      if (onFocusedIndexChange) {
        onFocusedIndexChange(index);
      } else {
        setInternalFocusedIndex(index);
      }
    },
    [onFocusedIndexChange]
  );

  // ---- options pipeline ----
  const sourceOptions = asyncConfig ? asyncOptions : staticOptions;

  // Index all source options into the cache map so selected values always resolve
  useMemo(() => {
    const indexOptions = (opts: OptionsOrGroups<TOption>) => {
      if (isGrouped(opts)) {
        for (const group of opts) {
          for (const o of group.options) {
            optionsByValueRef.current.set(getOptionValue(o), o);
          }
        }
      } else {
        for (const o of opts as TOption[]) {
          optionsByValueRef.current.set(getOptionValue(o), o);
        }
      }
    };
    indexOptions(sourceOptions);
  }, [sourceOptions, getOptionValue]);

  // Filter (only for local / non-async with searchable)
  const filteredOptions = useMemo(() => {
    if (!searchable || asyncConfig || !searchValue) return sourceOptions;
    return filterOptionsOrGroups(sourceOptions, searchValue, getOptionLabel, filterOption);
  }, [sourceOptions, searchable, asyncConfig, searchValue, getOptionLabel, filterOption]);

  // Flatten
  const flattenedItems = useMemo(
    () => flattenOptions(filteredOptions, getOptionValue, isOptionDisabled),
    [filteredOptions, getOptionValue, isOptionDisabled]
  );

  // ---- virtualizer ----
  const virtualizer = useVirtualizer({
    count: flattenedItems.length,
    getScrollElement: () => menuRef.current,
    estimateSize: () => estimatedOptionHeight,
    overscan,
    getItemKey: (index) => flattenedItems[index].key,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  const measureElement = useCallback(
    (node: Element | null) => {
      if (node) virtualizer.measureElement(node);
    },
    [virtualizer]
  );

  // ---- selected options resolution ----
  const selectedOptions = useMemo(
    () =>
      selectedValues
        .map((v) => optionsByValueRef.current.get(v))
        .filter((o): o is TOption => o !== undefined),
    [selectedValues]
  );

  const getOptionByValue = useCallback((value: string) => optionsByValueRef.current.get(value), []);

  // ---- async loading ----
  const loadAsync = useCallback(
    (input: string) => {
      if (!asyncConfig) return;

      // Check cache
      const cached = cacheRef.current.get(input);
      if (cached && cached.expiresAt > Date.now()) {
        setAsyncOptions(cached.data);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const currentLoadId = ++loadIdRef.current;

      asyncConfig.loadOptions(input).then(
        (result) => {
          // Stale guard
          if (currentLoadId !== loadIdRef.current) return;

          setAsyncOptions(result);
          setIsLoading(false);

          // Cache
          if (asyncConfig.cacheTtlMs && asyncConfig.cacheTtlMs > 0) {
            cacheRef.current.set(input, {
              data: result,
              expiresAt: Date.now() + asyncConfig.cacheTtlMs,
            });
          }
        },
        () => {
          if (currentLoadId !== loadIdRef.current) return;
          setIsLoading(false);
        }
      );
    },
    [asyncConfig, setIsLoading]
  );

  const debouncedLoadAsync = useCallback(
    (input: string) => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      const delay = asyncConfig?.debounceMs ?? DEFAULT_DEBOUNCE_MS;
      debounceTimerRef.current = setTimeout(() => loadAsync(input), delay);
    },
    [asyncConfig?.debounceMs, loadAsync]
  );

  // ---- actions ----
  const open = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
    setFocusedIndex(-1);
    setSubMenus([]);

    if (asyncConfig && asyncConfig.loadOnOpen !== false) {
      loadAsync(searchValue);
    }
  }, [disabled, setIsOpen, setFocusedIndex, asyncConfig, loadAsync, searchValue]);

  const close = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
    setSubMenus([]);
    if (searchable && clearSearchOnSelect) {
      setSearchValue('');
    }
  }, [setIsOpen, setFocusedIndex, searchable, clearSearchOnSelect, setSearchValue]);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, close, open]);

  const setSearch = useCallback(
    (value: string) => {
      setSearchValue(value);
      if (asyncConfig) {
        debouncedLoadAsync(value);
      }
    },
    [setSearchValue, asyncConfig, debouncedLoadAsync]
  );

  const selectValue = useCallback(
    (value: string) => {
      if (multiple) {
        if (!selectedValues.includes(value)) {
          setSelectedValues([...selectedValues, value]);
        }
      } else {
        setSelectedValues([value]);
      }

      if (clearSearchOnSelect && searchable) {
        setSearchValue('');
      }

      if (shouldCloseOnSelect) {
        close();
      }
    },
    [
      multiple,
      selectedValues,
      setSelectedValues,
      clearSearchOnSelect,
      searchable,
      setSearchValue,
      shouldCloseOnSelect,
      close,
    ]
  );

  const deselectValue = useCallback(
    (value: string) => {
      setSelectedValues(selectedValues.filter((v) => v !== value));
    },
    [selectedValues, setSelectedValues]
  );

  const toggleValue = useCallback(
    (value: string) => {
      if (selectedValues.includes(value)) {
        deselectValue(value);
      } else {
        selectValue(value);
      }
    },
    [selectedValues, selectValue, deselectValue]
  );

  const clearAll = useCallback(() => {
    setSelectedValues([]);
  }, [setSelectedValues]);

  // ---- cascade sub-menus ----
  const openSubMenu = useCallback(
    (option: TOption) => {
      if (!cascadeConfig) return;

      const parentValue = getOptionValue(option);

      // Check if already open for this option
      if (subMenus.some((sm) => sm.parentValue === parentValue)) return;

      // Determine the real depth: if the parent option lives inside an
      // existing sub-menu at depth D, the new sub-menu is at D+1.
      // If the parent is a root-level option, the new sub-menu is at depth 0.
      let newDepth = 0;
      for (const sm of subMenus) {
        if (sm.options.some((o) => getOptionValue(o) === parentValue)) {
          newDepth = sm.depth + 1;
          break;
        }
      }

      const result = cascadeConfig.getChildren(option);

      if (result === null) return;

      if (result instanceof Promise) {
        // Add a loading sub-menu, trimming any at the same depth or deeper
        setSubMenus((prev) => [
          ...prev.filter((sm) => sm.depth < newDepth),
          {
            parentOption: option,
            parentValue,
            options: [],
            depth: newDepth,
            isLoading: true,
            focusedIndex: -1,
          },
        ]);

        result.then((children) => {
          // Index children
          for (const child of children) {
            optionsByValueRef.current.set(getOptionValue(child), child);
          }
          setSubMenus((prev) =>
            prev.map((sm) =>
              sm.parentValue === parentValue ? { ...sm, options: children, isLoading: false } : sm
            )
          );
        });
      } else {
        // Sync children — trim any at the same depth or deeper, then append
        for (const child of result) {
          optionsByValueRef.current.set(getOptionValue(child), child);
        }
        setSubMenus((prev) => [
          ...prev.filter((sm) => sm.depth < newDepth),
          {
            parentOption: option,
            parentValue,
            options: result,
            depth: newDepth,
            isLoading: false,
            focusedIndex: -1,
          },
        ]);
      }
    },
    [cascadeConfig, getOptionValue, subMenus]
  );

  const closeSubMenus = useCallback(() => {
    setSubMenus([]);
  }, []);

  // ---- keyboard helpers ----
  const findNextSelectableIndex = useCallback(
    (from: number, direction: 1 | -1): number => {
      let index = from;
      while (index >= 0 && index < flattenedItems.length) {
        const item = flattenedItems[index];
        if (item.type === 'option' && !item.disabled) return index;
        index += direction;
      }
      return -1;
    },
    [flattenedItems]
  );

  // ---- keyboard navigation ----
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          if (!isOpen) {
            open();
            return;
          }
          const next = findNextSelectableIndex(focusedIndex + 1, 1);
          if (next !== -1) {
            setFocusedIndex(next);
            virtualizer.scrollToIndex(next, { align: 'auto' });
          }
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          if (!isOpen) {
            open();
            return;
          }
          const prev = findNextSelectableIndex(focusedIndex - 1, -1);
          if (prev !== -1) {
            setFocusedIndex(prev);
            virtualizer.scrollToIndex(prev, { align: 'auto' });
          }
          break;
        }
        case 'Home': {
          e.preventDefault();
          if (isOpen) {
            const first = findNextSelectableIndex(0, 1);
            if (first !== -1) {
              setFocusedIndex(first);
              virtualizer.scrollToIndex(first, { align: 'auto' });
            }
          }
          break;
        }
        case 'End': {
          e.preventDefault();
          if (isOpen) {
            const last = findNextSelectableIndex(flattenedItems.length - 1, -1);
            if (last !== -1) {
              setFocusedIndex(last);
              virtualizer.scrollToIndex(last, { align: 'auto' });
            }
          }
          break;
        }
        case 'Enter':
        case ' ': {
          if (!isOpen) {
            e.preventDefault();
            open();
            return;
          }
          // Space shouldn't select when searchable (it's a typing character)
          if (e.key === ' ' && searchable) return;
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < flattenedItems.length) {
            const item = flattenedItems[focusedIndex];
            if (item.type === 'option' && item.option && !item.disabled) {
              const value = getOptionValue(item.option);
              if (multiple) {
                toggleValue(value);
              } else {
                selectValue(value);
              }
            }
          }
          break;
        }
        case 'Escape': {
          e.preventDefault();
          if (subMenus.length > 0) {
            setSubMenus((prev) => prev.slice(0, -1));
          } else if (isOpen) {
            close();
            triggerRef.current?.focus();
          }
          break;
        }
        case 'ArrowRight': {
          if (cascadeConfig && isOpen && focusedIndex >= 0) {
            e.preventDefault();
            const item = flattenedItems[focusedIndex];
            if (item.type === 'option' && item.option) {
              openSubMenu(item.option);
            }
          }
          break;
        }
        case 'ArrowLeft': {
          if (cascadeConfig && subMenus.length > 0) {
            e.preventDefault();
            setSubMenus((prev) => prev.slice(0, -1));
          }
          break;
        }
        case 'Backspace': {
          if (multiple && searchable && searchValue === '' && selectedValues.length > 0) {
            deselectValue(selectedValues[selectedValues.length - 1]);
          }
          break;
        }
        case 'Tab': {
          if (isOpen) {
            close();
          }
          break;
        }
      }
    },
    [
      disabled,
      isOpen,
      open,
      close,
      focusedIndex,
      flattenedItems,
      findNextSelectableIndex,
      setFocusedIndex,
      virtualizer,
      getOptionValue,
      multiple,
      searchable,
      searchValue,
      selectedValues,
      selectValue,
      toggleValue,
      deselectValue,
      cascadeConfig,
      openSubMenu,
      subMenus,
    ]
  );

  const handleMenuKeyDown = handleKeyDown;

  const handleSearchInput = useCallback(
    (value: string) => {
      setSearch(value);
      if (!isOpen) {
        open();
      }
      // Reset focus when search changes
      setFocusedIndex(-1);
    },
    [setSearch, isOpen, open, setFocusedIndex]
  );

  // ---- close on outside click ----
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        close();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, close]);

  // ---- focus input when opened ----
  useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // ---- ARIA helpers ----
  const listboxId = `${instanceId}-listbox`;
  const activeDescendantId =
    focusedIndex >= 0 && focusedIndex < flattenedItems.length
      ? `${instanceId}-option-${focusedIndex}`
      : undefined;

  const getTriggerProps = useCallback(
    () => ({
      role: 'combobox' as const,
      'aria-expanded': isOpen,
      'aria-haspopup': 'listbox' as const,
      'aria-controls': isOpen ? listboxId : undefined,
      'aria-activedescendant': activeDescendantId,
      'aria-disabled': disabled || undefined,
      id: `${instanceId}-trigger`,
    }),
    [isOpen, listboxId, activeDescendantId, disabled, instanceId]
  );

  const getMenuProps = useCallback(
    () => ({
      role: 'listbox' as const,
      id: listboxId,
      'aria-multiselectable': multiple || undefined,
    }),
    [listboxId, multiple]
  );

  const getOptionProps = useCallback(
    (index: number) => {
      const item = flattenedItems[index];
      if (!item || item.type !== 'option' || !item.option) {
        return { role: 'presentation' as const };
      }

      const value = getOptionValue(item.option);
      const isSelected = selectedValues.includes(value);
      const isFocused = index === focusedIndex;

      return {
        role: 'option' as const,
        id: `${instanceId}-option-${index}`,
        'aria-selected': isSelected,
        'aria-disabled': item.disabled || undefined,
        'data-focused': isFocused || undefined,
        'data-selected': isSelected || undefined,
        'data-disabled': item.disabled || undefined,
        'data-value': value,
      };
    },
    [flattenedItems, getOptionValue, selectedValues, focusedIndex, instanceId]
  );

  const getInputProps = useCallback(
    () => ({
      role: 'searchbox' as const,
      'aria-autocomplete': 'list' as const,
      'aria-controls': isOpen ? listboxId : undefined,
      'aria-activedescendant': activeDescendantId,
      id: `${instanceId}-input`,
    }),
    [isOpen, listboxId, activeDescendantId, instanceId]
  );

  return {
    // Virtualizer
    virtualizer,
    virtualItems,
    totalSize,
    menuRef,
    measureElement,

    // Data
    flattenedItems,

    // State
    isOpen,
    searchValue,
    focusedIndex,
    selectedValues,
    selectedOptions,
    isLoading,

    // Sub-menus
    subMenus,

    // Actions
    open,
    close,
    toggle,
    setSearch,
    selectValue,
    deselectValue,
    toggleValue,
    clearAll,
    setFocusedIndex,
    openSubMenu,
    closeSubMenus,

    // Event handlers
    handleKeyDown,
    handleMenuKeyDown,
    handleSearchInput,

    // Refs
    containerRef,
    triggerRef,
    inputRef,

    // ARIA helpers
    getTriggerProps,
    getMenuProps,
    getOptionProps,
    getInputProps,

    // Resolved options
    getOptionByValue,
  };
}
