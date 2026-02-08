import { useRef, useCallback, useState, useEffect, useId, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type {
  UseVirtualSelectOptions,
  UseVirtualSelectReturn,
  FlattenedItem,
  OptionsOrGroups,
  OptionGroup,
} from './types';
import { useSelectAsync } from './useSelectAsync';
import { useSelectCascade } from './useSelectCascade';
import { useSelectKeyboard } from './useSelectKeyboard';

const DEFAULT_ESTIMATED_OPTION_HEIGHT = 36;
const DEFAULT_OVERSCAN = 5;

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
  const optionsByValueRef = useRef<Map<string, TOption>>(new Map());

  // ---- internal state (uncontrolled) ----
  const [internalValue, setInternalValue] = useState<string[]>(defaultValue);
  const [internalSearchValue, setInternalSearchValue] = useState('');
  const [internalIsOpen, setInternalIsOpen] = useState(defaultIsOpen);
  const [internalFocusedIndex, setInternalFocusedIndex] = useState(-1);

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

  // ---- sub-hooks ----
  const { asyncOptions, isLoading, loadError, loadAsync, debouncedLoadAsync } =
    useSelectAsync<TOption>(asyncConfig);

  const { subMenus, setSubMenus, openSubMenu, closeSubMenus } = useSelectCascade<TOption>(
    cascadeConfig,
    getOptionValue,
    optionsByValueRef
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

  // ---- actions ----
  const open = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
    setFocusedIndex(-1);
    setSubMenus([]);

    if (asyncConfig && asyncConfig.loadOnOpen !== false) {
      loadAsync(searchValue);
    }
  }, [disabled, setIsOpen, setFocusedIndex, setSubMenus, asyncConfig, loadAsync, searchValue]);

  const close = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
    setSubMenus([]);
    if (searchable && clearSearchOnSelect) {
      setSearchValue('');
    }
  }, [setIsOpen, setFocusedIndex, setSubMenus, searchable, clearSearchOnSelect, setSearchValue]);

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

  // ---- keyboard ----
  const { handleKeyDown, handleMenuKeyDown } = useSelectKeyboard<TOption>({
    disabled,
    isOpen,
    open,
    close,
    focusedIndex,
    setFocusedIndex,
    flattenedItems,
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
    setSubMenus,
    triggerRef,
  });

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
      'aria-activedescendant': activeDescendantId,
    }),
    [listboxId, multiple, activeDescendantId]
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
    loadError,

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
