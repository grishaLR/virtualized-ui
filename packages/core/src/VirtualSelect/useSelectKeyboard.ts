import { useCallback } from 'react';
import type { Virtualizer } from '@tanstack/react-virtual';
import type { FlattenedItem, SubMenuState, CascadeConfig } from './types';

const PAGE_SIZE = 10;

export interface UseSelectKeyboardOptions<TOption> {
  disabled: boolean;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
  flattenedItems: FlattenedItem<TOption>[];
  virtualizer: Virtualizer<HTMLDivElement, Element>;
  getOptionValue: (option: TOption) => string;
  multiple: boolean;
  searchable: boolean;
  searchValue: string;
  selectedValues: string[];
  selectValue: (value: string) => void;
  toggleValue: (value: string) => void;
  deselectValue: (value: string) => void;
  cascadeConfig: CascadeConfig<TOption> | undefined;
  openSubMenu: (option: TOption) => void;
  subMenus: SubMenuState<TOption>[];
  setSubMenus: React.Dispatch<React.SetStateAction<SubMenuState<TOption>[]>>;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export interface UseSelectKeyboardReturn {
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handleMenuKeyDown: (e: React.KeyboardEvent) => void;
  findNextSelectableIndex: (from: number, direction: 1 | -1) => number;
}

export function useSelectKeyboard<TOption>(
  opts: UseSelectKeyboardOptions<TOption>
): UseSelectKeyboardReturn {
  const {
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
  } = opts;

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
        case 'PageDown': {
          e.preventDefault();
          if (isOpen) {
            const target = findNextSelectableIndex(
              Math.min(focusedIndex + PAGE_SIZE, flattenedItems.length - 1),
              -1
            );
            if (target !== -1) {
              setFocusedIndex(target);
              virtualizer.scrollToIndex(target, { align: 'auto' });
            }
          }
          break;
        }
        case 'PageUp': {
          e.preventDefault();
          if (isOpen) {
            const target = findNextSelectableIndex(Math.max(focusedIndex - PAGE_SIZE, 0), 1);
            if (target !== -1) {
              setFocusedIndex(target);
              virtualizer.scrollToIndex(target, { align: 'auto' });
            }
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
      setSubMenus,
      triggerRef,
    ]
  );

  return { handleKeyDown, handleMenuKeyDown: handleKeyDown, findNextSelectableIndex };
}
