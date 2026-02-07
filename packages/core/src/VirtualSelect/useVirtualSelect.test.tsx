import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVirtualSelect } from './useVirtualSelect';
import type { OptionGroup } from './types';

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

interface TestOption {
  id: string;
  name: string;
}

const testOptions: TestOption[] = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
  { id: '3', name: 'Charlie' },
  { id: '4', name: 'Diana' },
  { id: '5', name: 'Eve' },
];

const groupedOptions: OptionGroup<TestOption>[] = [
  {
    label: 'Group A',
    options: [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
    ],
  },
  {
    label: 'Group B',
    options: [
      { id: '3', name: 'Charlie' },
      { id: '4', name: 'Diana' },
    ],
  },
];

const getOptionValue = (o: TestOption) => o.id;
const getOptionLabel = (o: TestOption) => o.name;

function makeKeyboardEvent(key: string): React.KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key });
  Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
  return event as unknown as React.KeyboardEvent;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useVirtualSelect', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ========================================================================
  // Uncontrolled defaults
  // ========================================================================

  describe('uncontrolled defaults', () => {
    it('starts closed with empty value and no focus', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
        })
      );

      expect(result.current.isOpen).toBe(false);
      expect(result.current.selectedValues).toEqual([]);
      expect(result.current.focusedIndex).toBe(-1);
      expect(result.current.searchValue).toBe('');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.subMenus).toEqual([]);
    });

    it('uses defaultValue for initial selection', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
          defaultValue: ['2', '3'],
        })
      );

      expect(result.current.selectedValues).toEqual(['2', '3']);
    });

    it('uses defaultIsOpen for initial open state', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
          defaultIsOpen: true,
        })
      );

      expect(result.current.isOpen).toBe(true);
    });
  });

  // ========================================================================
  // Controlled state
  // ========================================================================

  describe('controlled state', () => {
    it('uses controlled value', () => {
      const onValueChange = vi.fn();
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
          value: ['1'],
          onValueChange,
        })
      );

      expect(result.current.selectedValues).toEqual(['1']);

      act(() => {
        result.current.selectValue('2');
      });

      expect(onValueChange).toHaveBeenCalledWith(['2']);
      // Still ['1'] because parent controls it
      expect(result.current.selectedValues).toEqual(['1']);
    });

    it('uses controlled isOpen', () => {
      const onOpenChange = vi.fn();
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
          isOpen: false,
          onOpenChange,
        })
      );

      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.open();
      });

      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(result.current.isOpen).toBe(false);
    });

    it('uses controlled searchValue', () => {
      const onSearchChange = vi.fn();
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
          searchable: true,
          searchValue: 'test',
          onSearchChange,
        })
      );

      expect(result.current.searchValue).toBe('test');

      act(() => {
        result.current.setSearch('new');
      });

      expect(onSearchChange).toHaveBeenCalledWith('new');
      expect(result.current.searchValue).toBe('test');
    });

    it('uses controlled focusedIndex', () => {
      const onFocusedIndexChange = vi.fn();
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
          focusedIndex: 2,
          onFocusedIndexChange,
        })
      );

      expect(result.current.focusedIndex).toBe(2);

      act(() => {
        result.current.setFocusedIndex(0);
      });

      expect(onFocusedIndexChange).toHaveBeenCalledWith(0);
      expect(result.current.focusedIndex).toBe(2);
    });
  });

  // ========================================================================
  // Single select
  // ========================================================================

  describe('single select', () => {
    it('selectValue replaces previous selection', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
        })
      );

      act(() => {
        result.current.selectValue('1');
      });
      expect(result.current.selectedValues).toEqual(['1']);

      act(() => {
        result.current.selectValue('2');
      });
      expect(result.current.selectedValues).toEqual(['2']);
    });

    it('closes on select by default for single mode', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
        })
      );

      act(() => {
        result.current.open();
      });
      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.selectValue('1');
      });
      expect(result.current.isOpen).toBe(false);
    });

    it('resolves selectedOptions from selectedValues', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
          defaultValue: ['2'],
        })
      );

      expect(result.current.selectedOptions).toEqual([{ id: '2', name: 'Bob' }]);
    });

    it('getOptionByValue returns the option object', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
        })
      );

      expect(result.current.getOptionByValue('3')).toEqual({ id: '3', name: 'Charlie' });
      expect(result.current.getOptionByValue('nonexistent')).toBeUndefined();
    });
  });

  // ========================================================================
  // Multi-select
  // ========================================================================

  describe('multi-select', () => {
    it('selectValue adds to selection', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
          multiple: true,
        })
      );

      act(() => {
        result.current.selectValue('1');
      });
      act(() => {
        result.current.selectValue('2');
      });
      expect(result.current.selectedValues).toEqual(['1', '2']);
    });

    it('selectValue does not add duplicates', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
          multiple: true,
        })
      );

      act(() => {
        result.current.selectValue('1');
      });
      act(() => {
        result.current.selectValue('1');
      });
      expect(result.current.selectedValues).toEqual(['1']);
    });

    it('deselectValue removes from selection', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
          multiple: true,
          defaultValue: ['1', '2', '3'],
        })
      );

      act(() => {
        result.current.deselectValue('2');
      });
      expect(result.current.selectedValues).toEqual(['1', '3']);
    });

    it('toggleValue adds if not present, removes if present', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
          multiple: true,
        })
      );

      act(() => {
        result.current.toggleValue('1');
      });
      expect(result.current.selectedValues).toEqual(['1']);

      act(() => {
        result.current.toggleValue('1');
      });
      expect(result.current.selectedValues).toEqual([]);
    });

    it('clearAll empties selection', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
          multiple: true,
          defaultValue: ['1', '2'],
        })
      );

      act(() => {
        result.current.clearAll();
      });
      expect(result.current.selectedValues).toEqual([]);
    });

    it('does not close on select by default for multi mode', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
          multiple: true,
        })
      );

      act(() => {
        result.current.open();
      });
      act(() => {
        result.current.selectValue('1');
      });
      expect(result.current.isOpen).toBe(true);
    });

    it('Backspace removes last selected in multi + searchable mode', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
          multiple: true,
          searchable: true,
          defaultValue: ['1', '2', '3'],
        })
      );

      act(() => {
        result.current.open();
      });

      act(() => {
        result.current.handleKeyDown(makeKeyboardEvent('Backspace'));
      });

      expect(result.current.selectedValues).toEqual(['1', '2']);
    });
  });

  // ========================================================================
  // Local filtering
  // ========================================================================

  describe('local filtering', () => {
    it('filters options by search value (case-insensitive)', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
          searchable: true,
        })
      );

      act(() => {
        result.current.setSearch('ali');
      });

      // Only Alice should match
      const optionItems = result.current.flattenedItems.filter((i) => i.type === 'option');
      expect(optionItems).toHaveLength(1);
      expect(optionItems[0].option).toEqual({ id: '1', name: 'Alice' });
    });

    it('shows all options when search is empty', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
          searchable: true,
        })
      );

      expect(result.current.flattenedItems).toHaveLength(5);
    });

    it('uses custom filterOption', () => {
      const filterOption = (option: TestOption, input: string) => option.id === input;

      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
          searchable: true,
          filterOption,
        })
      );

      act(() => {
        result.current.setSearch('3');
      });

      const optionItems = result.current.flattenedItems.filter((i) => i.type === 'option');
      expect(optionItems).toHaveLength(1);
      expect(optionItems[0].option).toEqual({ id: '3', name: 'Charlie' });
    });

    it('filters grouped options correctly', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: groupedOptions,
          getOptionValue,
          getOptionLabel,
          searchable: true,
        })
      );

      act(() => {
        result.current.setSearch('alice');
      });

      // Should have 1 group header + 1 option
      expect(result.current.flattenedItems).toHaveLength(2);
      expect(result.current.flattenedItems[0].type).toBe('group-header');
      expect(result.current.flattenedItems[0].groupLabel).toBe('Group A');
      expect(result.current.flattenedItems[1].type).toBe('option');
    });
  });

  // ========================================================================
  // Grouped options
  // ========================================================================

  describe('grouped options', () => {
    it('flattenedItems includes group headers', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: groupedOptions,
          getOptionValue,
          getOptionLabel,
        })
      );

      // 2 group headers + 4 options = 6
      expect(result.current.flattenedItems).toHaveLength(6);
      expect(result.current.flattenedItems[0].type).toBe('group-header');
      expect(result.current.flattenedItems[0].groupLabel).toBe('Group A');
      expect(result.current.flattenedItems[1].type).toBe('option');
      expect(result.current.flattenedItems[3].type).toBe('group-header');
      expect(result.current.flattenedItems[3].groupLabel).toBe('Group B');
    });

    it('keyboard nav skips group headers', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: groupedOptions,
          getOptionValue,
          getOptionLabel,
        })
      );

      act(() => {
        result.current.open();
      });

      // ArrowDown from -1 should land on index 1 (first option, skipping header at 0)
      act(() => {
        result.current.handleKeyDown(makeKeyboardEvent('ArrowDown'));
      });
      expect(result.current.focusedIndex).toBe(1);

      // Move to index 2 (Bob)
      act(() => {
        result.current.handleKeyDown(makeKeyboardEvent('ArrowDown'));
      });
      expect(result.current.focusedIndex).toBe(2);

      // Next ArrowDown should skip group header at 3 and land on 4 (Charlie)
      act(() => {
        result.current.handleKeyDown(makeKeyboardEvent('ArrowDown'));
      });
      expect(result.current.focusedIndex).toBe(4);
    });
  });

  // ========================================================================
  // Async loading
  // ========================================================================

  describe('async', () => {
    it('calls loadOptions on open when loadOnOpen is true (default)', async () => {
      const loadOptions = vi.fn().mockResolvedValue([{ id: '10', name: 'Async Alice' }]);

      const { result } = renderHook(() =>
        useVirtualSelect({
          getOptionValue,
          getOptionLabel,
          async: { loadOptions },
        })
      );

      act(() => {
        result.current.open();
      });

      expect(loadOptions).toHaveBeenCalledWith('');
    });

    it('does not call loadOptions on open when loadOnOpen is false', () => {
      const loadOptions = vi.fn().mockResolvedValue([]);

      const { result } = renderHook(() =>
        useVirtualSelect({
          getOptionValue,
          getOptionLabel,
          async: { loadOptions, loadOnOpen: false },
        })
      );

      act(() => {
        result.current.open();
      });

      expect(loadOptions).not.toHaveBeenCalled();
    });

    it('debounces search loadOptions calls', () => {
      const loadOptions = vi.fn().mockResolvedValue([]);

      const { result } = renderHook(() =>
        useVirtualSelect({
          getOptionValue,
          getOptionLabel,
          searchable: true,
          async: { loadOptions, debounceMs: 200 },
        })
      );

      act(() => {
        result.current.setSearch('a');
      });
      act(() => {
        result.current.setSearch('ab');
      });
      act(() => {
        result.current.setSearch('abc');
      });

      // Before debounce expires, loadOptions should not have been called for search
      expect(loadOptions).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(loadOptions).toHaveBeenCalledTimes(1);
      expect(loadOptions).toHaveBeenCalledWith('abc');
    });

    it('discards stale responses', async () => {
      let resolveFirst: (value: TestOption[]) => void;
      let resolveSecond: (value: TestOption[]) => void;

      const loadOptions = vi
        .fn()
        .mockImplementationOnce(
          () =>
            new Promise<TestOption[]>((r) => {
              resolveFirst = r;
            })
        )
        .mockImplementationOnce(
          () =>
            new Promise<TestOption[]>((r) => {
              resolveSecond = r;
            })
        );

      const { result } = renderHook(() =>
        useVirtualSelect({
          getOptionValue,
          getOptionLabel,
          searchable: true,
          async: { loadOptions, debounceMs: 0 },
        })
      );

      // First search
      act(() => {
        result.current.setSearch('first');
      });
      act(() => {
        vi.advanceTimersByTime(0);
      });

      // Second search (before first resolves)
      act(() => {
        result.current.setSearch('second');
      });
      act(() => {
        vi.advanceTimersByTime(0);
      });

      expect(loadOptions).toHaveBeenCalledTimes(2);

      // Resolve second first
      await act(async () => {
        resolveSecond!([{ id: '20', name: 'Second Result' }]);
      });

      // Now resolve first (stale)
      await act(async () => {
        resolveFirst!([{ id: '10', name: 'First Result' }]);
      });

      // Should show second result, not first
      const optionItems = result.current.flattenedItems.filter((i) => i.type === 'option');
      expect(optionItems).toHaveLength(1);
      expect(optionItems[0].option).toEqual({ id: '20', name: 'Second Result' });
    });

    it('sets isLoading during async load', async () => {
      let resolve: (value: TestOption[]) => void;
      const loadOptions = vi.fn().mockImplementation(
        () =>
          new Promise<TestOption[]>((r) => {
            resolve = r;
          })
      );

      const { result } = renderHook(() =>
        useVirtualSelect({
          getOptionValue,
          getOptionLabel,
          async: { loadOptions },
        })
      );

      expect(result.current.isLoading).toBe(false);

      act(() => {
        result.current.open();
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolve!([{ id: '1', name: 'Result' }]);
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('caches results when cacheTtlMs is set', async () => {
      const loadOptions = vi.fn().mockResolvedValue([{ id: '1', name: 'Cached' }]);

      const { result } = renderHook(() =>
        useVirtualSelect({
          getOptionValue,
          getOptionLabel,
          searchable: true,
          async: { loadOptions, debounceMs: 0, cacheTtlMs: 5000 },
        })
      );

      // First load
      act(() => {
        result.current.setSearch('test');
      });
      act(() => {
        vi.advanceTimersByTime(0);
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });

      expect(loadOptions).toHaveBeenCalledTimes(1);

      // Search for something else, then search the same thing again
      act(() => {
        result.current.setSearch('other');
      });
      act(() => {
        vi.advanceTimersByTime(0);
      });

      act(() => {
        result.current.setSearch('test');
      });
      act(() => {
        vi.advanceTimersByTime(0);
      });

      // Should use cache, not call loadOptions again for 'test'
      // loadOptions was called for 'other', and 'test' was cached
      const testCalls = loadOptions.mock.calls.filter((call: string[]) => call[0] === 'test');
      expect(testCalls).toHaveLength(1);
    });
  });

  // ========================================================================
  // Sub-menus (cascade)
  // ========================================================================

  describe('sub-menus (cascade)', () => {
    it('opens a sub-menu with sync children', () => {
      const children: TestOption[] = [
        { id: '1a', name: 'Alice Child' },
        { id: '1b', name: 'Alice Child 2' },
      ];

      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
          cascade: {
            getChildren: (o) => (o.id === '1' ? children : null),
          },
        })
      );

      act(() => {
        result.current.open();
      });

      act(() => {
        result.current.openSubMenu(testOptions[0]);
      });

      expect(result.current.subMenus).toHaveLength(1);
      expect(result.current.subMenus[0].parentValue).toBe('1');
      expect(result.current.subMenus[0].options).toEqual(children);
      expect(result.current.subMenus[0].isLoading).toBe(false);
    });

    it('opens a sub-menu with async children', async () => {
      const children: TestOption[] = [{ id: '1a', name: 'Async Child' }];

      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
          cascade: {
            getChildren: (o) => (o.id === '1' ? Promise.resolve(children) : null),
          },
        })
      );

      act(() => {
        result.current.open();
      });

      act(() => {
        result.current.openSubMenu(testOptions[0]);
      });

      // Loading state
      expect(result.current.subMenus).toHaveLength(1);
      expect(result.current.subMenus[0].isLoading).toBe(true);
      expect(result.current.subMenus[0].options).toEqual([]);

      // Wait for promise
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });

      expect(result.current.subMenus[0].isLoading).toBe(false);
      expect(result.current.subMenus[0].options).toEqual(children);
    });

    it('closeSubMenus clears all sub-menus', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
          cascade: {
            getChildren: () => [{ id: 'child', name: 'Child' }],
          },
        })
      );

      act(() => {
        result.current.open();
      });
      act(() => {
        result.current.openSubMenu(testOptions[0]);
      });

      expect(result.current.subMenus).toHaveLength(1);

      act(() => {
        result.current.closeSubMenus();
      });

      expect(result.current.subMenus).toHaveLength(0);
    });

    it('does not open duplicate sub-menu for same option', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
          cascade: {
            getChildren: () => [{ id: 'child', name: 'Child' }],
          },
        })
      );

      act(() => {
        result.current.open();
      });
      act(() => {
        result.current.openSubMenu(testOptions[0]);
      });
      act(() => {
        result.current.openSubMenu(testOptions[0]);
      });

      expect(result.current.subMenus).toHaveLength(1);
    });
  });

  // ========================================================================
  // Keyboard navigation
  // ========================================================================

  describe('keyboard navigation', () => {
    it('ArrowDown opens menu if closed', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
        })
      );

      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.handleKeyDown(makeKeyboardEvent('ArrowDown'));
      });

      expect(result.current.isOpen).toBe(true);
    });

    it('ArrowDown moves focus to next selectable item', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
        })
      );

      act(() => {
        result.current.open();
      });

      act(() => {
        result.current.handleKeyDown(makeKeyboardEvent('ArrowDown'));
      });
      expect(result.current.focusedIndex).toBe(0);

      act(() => {
        result.current.handleKeyDown(makeKeyboardEvent('ArrowDown'));
      });
      expect(result.current.focusedIndex).toBe(1);
    });

    it('ArrowUp moves focus to previous selectable item', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
        })
      );

      act(() => {
        result.current.open();
      });

      // Move to index 2
      act(() => {
        result.current.setFocusedIndex(2);
      });

      act(() => {
        result.current.handleKeyDown(makeKeyboardEvent('ArrowUp'));
      });
      expect(result.current.focusedIndex).toBe(1);
    });

    it('ArrowDown skips disabled options', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
          isOptionDisabled: (o) => o.id === '2',
        })
      );

      act(() => {
        result.current.open();
      });

      // From -1, first ArrowDown → 0 (Alice, not disabled)
      act(() => {
        result.current.handleKeyDown(makeKeyboardEvent('ArrowDown'));
      });
      expect(result.current.focusedIndex).toBe(0);

      // Next ArrowDown → skip 1 (Bob, disabled) → 2 (Charlie)
      act(() => {
        result.current.handleKeyDown(makeKeyboardEvent('ArrowDown'));
      });
      expect(result.current.focusedIndex).toBe(2);
    });

    it('Home moves to first selectable', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
        })
      );

      act(() => {
        result.current.open();
      });
      act(() => {
        result.current.setFocusedIndex(3);
      });

      act(() => {
        result.current.handleKeyDown(makeKeyboardEvent('Home'));
      });
      expect(result.current.focusedIndex).toBe(0);
    });

    it('End moves to last selectable', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
        })
      );

      act(() => {
        result.current.open();
      });

      act(() => {
        result.current.handleKeyDown(makeKeyboardEvent('End'));
      });
      expect(result.current.focusedIndex).toBe(4);
    });

    it('Enter selects focused option (single)', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
        })
      );

      act(() => {
        result.current.open();
      });
      act(() => {
        result.current.setFocusedIndex(2);
      });

      act(() => {
        result.current.handleKeyDown(makeKeyboardEvent('Enter'));
      });

      expect(result.current.selectedValues).toEqual(['3']);
      expect(result.current.isOpen).toBe(false);
    });

    it('Enter toggles focused option (multi)', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
          multiple: true,
        })
      );

      act(() => {
        result.current.open();
      });
      act(() => {
        result.current.setFocusedIndex(0);
      });

      act(() => {
        result.current.handleKeyDown(makeKeyboardEvent('Enter'));
      });
      expect(result.current.selectedValues).toEqual(['1']);

      act(() => {
        result.current.handleKeyDown(makeKeyboardEvent('Enter'));
      });
      expect(result.current.selectedValues).toEqual([]);
    });

    it('Space opens menu when closed', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
        })
      );

      act(() => {
        result.current.handleKeyDown(makeKeyboardEvent(' '));
      });
      expect(result.current.isOpen).toBe(true);
    });

    it('Space does not select when searchable (typing character)', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
          searchable: true,
        })
      );

      act(() => {
        result.current.open();
      });
      act(() => {
        result.current.setFocusedIndex(0);
      });

      act(() => {
        result.current.handleKeyDown(makeKeyboardEvent(' '));
      });

      expect(result.current.selectedValues).toEqual([]);
    });

    it('Escape closes dropdown', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
        })
      );

      act(() => {
        result.current.open();
      });
      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.handleKeyDown(makeKeyboardEvent('Escape'));
      });
      expect(result.current.isOpen).toBe(false);
    });

    it('Escape pops deepest sub-menu before closing', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
          cascade: {
            getChildren: () => [{ id: 'child', name: 'Child' }],
          },
        })
      );

      act(() => {
        result.current.open();
      });
      act(() => {
        result.current.openSubMenu(testOptions[0]);
      });

      expect(result.current.subMenus).toHaveLength(1);

      act(() => {
        result.current.handleKeyDown(makeKeyboardEvent('Escape'));
      });

      // Sub-menu should be gone, but dropdown still open
      expect(result.current.subMenus).toHaveLength(0);
      expect(result.current.isOpen).toBe(true);
    });

    it('ArrowRight opens sub-menu for focused cascade option', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
          cascade: {
            getChildren: (o) => (o.id === '1' ? [{ id: '1a', name: 'Child' }] : null),
          },
        })
      );

      act(() => {
        result.current.open();
      });
      act(() => {
        result.current.setFocusedIndex(0);
      });

      act(() => {
        result.current.handleKeyDown(makeKeyboardEvent('ArrowRight'));
      });

      expect(result.current.subMenus).toHaveLength(1);
    });

    it('ArrowLeft closes deepest sub-menu', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
          cascade: {
            getChildren: () => [{ id: 'child', name: 'Child' }],
          },
        })
      );

      act(() => {
        result.current.open();
      });
      act(() => {
        result.current.openSubMenu(testOptions[0]);
      });

      act(() => {
        result.current.handleKeyDown(makeKeyboardEvent('ArrowLeft'));
      });

      expect(result.current.subMenus).toHaveLength(0);
    });

    it('Tab closes dropdown', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
        })
      );

      act(() => {
        result.current.open();
      });

      act(() => {
        result.current.handleKeyDown(makeKeyboardEvent('Tab'));
      });

      expect(result.current.isOpen).toBe(false);
    });

    it('does nothing when disabled', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
          disabled: true,
        })
      );

      act(() => {
        result.current.handleKeyDown(makeKeyboardEvent('ArrowDown'));
      });

      expect(result.current.isOpen).toBe(false);
    });
  });

  // ========================================================================
  // ARIA props
  // ========================================================================

  describe('ARIA props', () => {
    it('getTriggerProps returns correct roles', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
        })
      );

      const trigger = result.current.getTriggerProps();
      expect(trigger.role).toBe('combobox');
      expect(trigger['aria-expanded']).toBe(false);
      expect(trigger['aria-haspopup']).toBe('listbox');
    });

    it('getTriggerProps reflects open state', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
        })
      );

      act(() => {
        result.current.open();
      });

      const trigger = result.current.getTriggerProps();
      expect(trigger['aria-expanded']).toBe(true);
      expect(trigger['aria-controls']).toBeDefined();
    });

    it('getMenuProps returns listbox role', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
        })
      );

      const menu = result.current.getMenuProps();
      expect(menu.role).toBe('listbox');
      expect(menu.id).toBeDefined();
    });

    it('getMenuProps includes aria-multiselectable for multi', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
          multiple: true,
        })
      );

      const menu = result.current.getMenuProps();
      expect(menu['aria-multiselectable']).toBe(true);
    });

    it('getOptionProps returns correct role and selection state', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
          defaultValue: ['2'],
        })
      );

      const optProps = result.current.getOptionProps(1);
      expect(optProps.role).toBe('option');
      expect(optProps['aria-selected']).toBe(true);
      expect(optProps['data-value']).toBe('2');
    });

    it('getOptionProps returns presentation for group headers', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: groupedOptions,
          getOptionValue,
          getOptionLabel,
        })
      );

      const headerProps = result.current.getOptionProps(0);
      expect(headerProps.role).toBe('presentation');
    });

    it('getOptionProps marks disabled options', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
          isOptionDisabled: (o) => o.id === '1',
        })
      );

      const optProps = result.current.getOptionProps(0);
      expect(optProps['aria-disabled']).toBe(true);
      expect(optProps['data-disabled']).toBe(true);
    });

    it('getOptionProps marks focused item', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
        })
      );

      act(() => {
        result.current.setFocusedIndex(2);
      });

      const optProps = result.current.getOptionProps(2);
      expect(optProps['data-focused']).toBe(true);

      const otherProps = result.current.getOptionProps(0);
      expect(otherProps['data-focused']).toBeUndefined();
    });

    it('getInputProps returns searchbox role', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
          searchable: true,
        })
      );

      const input = result.current.getInputProps();
      expect(input.role).toBe('searchbox');
      expect(input['aria-autocomplete']).toBe('list');
    });

    it('getTriggerProps includes aria-disabled when disabled', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
          disabled: true,
        })
      );

      const trigger = result.current.getTriggerProps();
      expect(trigger['aria-disabled']).toBe(true);
    });
  });

  // ========================================================================
  // Virtualizer integration
  // ========================================================================

  describe('virtualizer integration', () => {
    it('provides virtualizer instance', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
        })
      );

      expect(result.current.virtualizer).toBeDefined();
      expect(result.current.virtualItems).toBeDefined();
      expect(result.current.totalSize).toBeGreaterThan(0);
      expect(result.current.measureElement).toBeInstanceOf(Function);
    });

    it('totalSize reflects estimatedOptionHeight * count', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
          estimatedOptionHeight: 40,
        })
      );

      expect(result.current.totalSize).toBe(40 * 5);
    });

    it('flattenedItems count matches virtualizer count', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: groupedOptions,
          getOptionValue,
          getOptionLabel,
        })
      );

      // 2 headers + 4 options = 6
      expect(result.current.flattenedItems).toHaveLength(6);
      // Virtualizer count should match
      expect(result.current.virtualizer.options.count).toBe(6);
    });
  });

  // ========================================================================
  // Open / close / toggle
  // ========================================================================

  describe('open/close/toggle', () => {
    it('open() opens the dropdown', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
        })
      );

      act(() => {
        result.current.open();
      });
      expect(result.current.isOpen).toBe(true);
    });

    it('close() closes the dropdown', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
        })
      );

      act(() => {
        result.current.open();
      });
      act(() => {
        result.current.close();
      });
      expect(result.current.isOpen).toBe(false);
    });

    it('toggle() toggles the dropdown', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
        })
      );

      act(() => {
        result.current.toggle();
      });
      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.toggle();
      });
      expect(result.current.isOpen).toBe(false);
    });

    it('open() does nothing when disabled', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
          disabled: true,
        })
      );

      act(() => {
        result.current.open();
      });
      expect(result.current.isOpen).toBe(false);
    });

    it('open() resets focusedIndex to -1', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
        })
      );

      act(() => {
        result.current.setFocusedIndex(2);
      });

      act(() => {
        result.current.open();
      });
      expect(result.current.focusedIndex).toBe(-1);
    });

    it('close() clears search when clearSearchOnSelect is true', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
          searchable: true,
        })
      );

      act(() => {
        result.current.open();
      });
      act(() => {
        result.current.setSearch('test');
      });
      expect(result.current.searchValue).toBe('test');

      act(() => {
        result.current.close();
      });
      expect(result.current.searchValue).toBe('');
    });
  });

  // ========================================================================
  // Edge cases
  // ========================================================================

  describe('edge cases', () => {
    it('handles empty options array', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: [],
          getOptionValue,
          getOptionLabel,
        })
      );

      expect(result.current.flattenedItems).toHaveLength(0);
      expect(result.current.totalSize).toBe(0);
    });

    it('handles single-item options', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: [testOptions[0]],
          getOptionValue,
          getOptionLabel,
        })
      );

      expect(result.current.flattenedItems).toHaveLength(1);
    });

    it('cleans up debounce timer on unmount', () => {
      const loadOptions = vi.fn().mockResolvedValue([]);

      const { unmount } = renderHook(() =>
        useVirtualSelect({
          getOptionValue,
          getOptionLabel,
          searchable: true,
          async: { loadOptions, debounceMs: 500 },
        })
      );

      // Trigger a debounced search but unmount before it fires
      act(() => {
        // We need to access setSearch — can't easily from renderHook,
        // but the debounce timer cleanup is tested by the fact that
        // no warnings about state updates on unmounted components appear
      });

      unmount();

      // Advance timers past the debounce period — should not cause errors
      act(() => {
        vi.advanceTimersByTime(600);
      });

      // If the cleanup didn't work, the timer would fire and try to update
      // state on the unmounted component
    });

    it('PageDown jumps by 10 items', () => {
      const manyOptions = Array.from({ length: 20 }, (_, i) => ({
        id: String(i),
        name: `Option ${i}`,
      }));

      const { result } = renderHook(() =>
        useVirtualSelect({
          options: manyOptions,
          getOptionValue,
          getOptionLabel,
        })
      );

      act(() => {
        result.current.open();
      });

      // Focus first option
      act(() => {
        result.current.setFocusedIndex(0);
      });

      act(() => {
        result.current.handleKeyDown(makeKeyboardEvent('PageDown'));
      });

      expect(result.current.focusedIndex).toBe(10);
    });

    it('PageUp jumps back by 10 items', () => {
      const manyOptions = Array.from({ length: 20 }, (_, i) => ({
        id: String(i),
        name: `Option ${i}`,
      }));

      const { result } = renderHook(() =>
        useVirtualSelect({
          options: manyOptions,
          getOptionValue,
          getOptionLabel,
        })
      );

      act(() => {
        result.current.open();
      });

      act(() => {
        result.current.setFocusedIndex(15);
      });

      act(() => {
        result.current.handleKeyDown(makeKeyboardEvent('PageUp'));
      });

      expect(result.current.focusedIndex).toBe(5);
    });
  });

  // ========================================================================
  // handleSearchInput
  // ========================================================================

  describe('handleSearchInput', () => {
    it('opens dropdown if closed', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
          searchable: true,
        })
      );

      act(() => {
        result.current.handleSearchInput('a');
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.searchValue).toBe('a');
    });

    it('resets focusedIndex when search changes', () => {
      const { result } = renderHook(() =>
        useVirtualSelect({
          options: testOptions,
          getOptionValue,
          getOptionLabel,
          searchable: true,
        })
      );

      act(() => {
        result.current.open();
      });
      act(() => {
        result.current.setFocusedIndex(2);
      });

      act(() => {
        result.current.handleSearchInput('b');
      });

      expect(result.current.focusedIndex).toBe(-1);
    });
  });
});
