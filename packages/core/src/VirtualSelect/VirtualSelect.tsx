import React from 'react';
import { useVirtualSelect } from './useVirtualSelect';
import type {
  VirtualSelectProps,
  TriggerSlotProps,
  MenuListSlotProps,
  OptionSlotProps,
  GroupHeaderSlotProps,
  TagSlotProps,
  NoOptionsSlotProps,
  LoadingSlotProps,
  SubMenuSlotProps,
  ClearIndicatorSlotProps,
  DropdownIndicatorSlotProps,
  InputSlotProps,
} from './types';

const DEFAULT_MENU_HEIGHT = 300;

// ---------------------------------------------------------------------------
// Default slot components — minimal semantic markup, no styles
// ---------------------------------------------------------------------------

function DefaultTrigger(props: TriggerSlotProps) {
  const {
    isOpen,
    disabled,
    placeholder,
    multiple,
    selectedLabels,
    onClick,
    triggerRef,
    ariaProps,
  } = props;

  // In multi mode, the tags handle display — trigger only shows placeholder when empty
  const displayText = multiple
    ? selectedLabels.length === 0
      ? placeholder
      : ''
    : selectedLabels.length > 0
      ? selectedLabels[0]
      : placeholder;

  const isPlaceholder = multiple ? selectedLabels.length === 0 : selectedLabels.length === 0;

  return (
    <button
      ref={triggerRef as React.RefObject<HTMLButtonElement>}
      type="button"
      disabled={disabled}
      onClick={onClick}
      data-open={isOpen || undefined}
      data-placeholder={isPlaceholder || undefined}
    >
      <span {...ariaProps}>{displayText}</span>
    </button>
  );
}

function DefaultInput(props: InputSlotProps) {
  const { value, onChange, inputRef, ariaProps } = props;
  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...ariaProps}
    />
  );
}

function DefaultMenuList(props: MenuListSlotProps) {
  const { menuRef, virtualItems, totalSize, renderItem, ariaProps } = props;
  return (
    <div
      ref={menuRef as React.RefObject<HTMLDivElement>}
      style={{ flex: 1, minHeight: 0, overflow: 'auto', position: 'relative' }}
      {...ariaProps}
    >
      <div style={{ height: totalSize, position: 'relative' }}>
        {virtualItems.map((vi) => renderItem(vi))}
      </div>
    </div>
  );
}

function DefaultOption<TOption>(props: OptionSlotProps<TOption>) {
  const { label, hasCascade, onClick, ariaProps, dataAttributes } = props;
  return (
    <div onClick={onClick} {...ariaProps} {...dataAttributes}>
      <span>{label}</span>
      {hasCascade && <span aria-hidden="true"> ▸</span>}
    </div>
  );
}

function DefaultGroupHeader(props: GroupHeaderSlotProps) {
  return (
    <div role="presentation">
      <span>{props.label}</span>
    </div>
  );
}

function DefaultTag(props: TagSlotProps) {
  return (
    <span data-value={props.value}>
      {props.label}
      <button type="button" onClick={props.onRemove} aria-label={`Remove ${props.label}`}>
        ×
      </button>
    </span>
  );
}

function DefaultNoOptions(props: NoOptionsSlotProps) {
  return <div>{props.searchValue ? 'No results found' : 'No options'}</div>;
}

function DefaultLoading(_props: LoadingSlotProps) {
  return <div>Loading…</div>;
}

function DefaultSubMenu<TOption>(props: SubMenuSlotProps<TOption>) {
  const { subMenu, getOptionLabel, getOptionValue, onSelect, onHover, onOpenChild } = props;

  if (subMenu.isLoading) {
    return <div style={{ position: 'absolute', left: '100%', top: 0 }}>Loading…</div>;
  }

  return (
    <div role="listbox" style={{ position: 'absolute', left: '100%', top: 0 }}>
      {subMenu.options.map((option, i) => {
        const value = getOptionValue(option);
        return (
          <div
            key={value}
            role="option"
            aria-selected={false}
            data-focused={i === subMenu.focusedIndex || undefined}
            onClick={() => onSelect(value)}
            onMouseEnter={() => onHover(i)}
            onDoubleClick={() => onOpenChild(option)}
          >
            {getOptionLabel(option)}
          </div>
        );
      })}
    </div>
  );
}

function DefaultClearIndicator(props: ClearIndicatorSlotProps) {
  return (
    <button type="button" onClick={props.onClick} aria-label="Clear selection">
      ×
    </button>
  );
}

function DefaultDropdownIndicator(props: DropdownIndicatorSlotProps) {
  return <span aria-hidden="true">{props.isOpen ? '▲' : '▼'}</span>;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function VirtualSelect<TOption>(props: VirtualSelectProps<TOption>) {
  const { components, menuHeight = DEFAULT_MENU_HEIGHT, className, style, ...hookOptions } = props;

  const select = useVirtualSelect(hookOptions);

  // Resolve slots
  const Trigger = components?.Trigger ?? DefaultTrigger;
  const Input = components?.Input ?? DefaultInput;
  const MenuList = components?.MenuList ?? DefaultMenuList;
  const OptionSlot = (components?.Option ?? DefaultOption) as typeof DefaultOption<TOption>;
  const GroupHeader = components?.GroupHeader ?? DefaultGroupHeader;
  const Tag = components?.Tag ?? DefaultTag;
  const NoOptions = components?.NoOptions ?? DefaultNoOptions;
  const Loading = components?.Loading ?? DefaultLoading;
  const SubMenuSlot = (components?.SubMenu ?? DefaultSubMenu) as typeof DefaultSubMenu<TOption>;
  const ClearIndicator = components?.ClearIndicator ?? DefaultClearIndicator;
  const DropdownIndicator = components?.DropdownIndicator ?? DefaultDropdownIndicator;

  const selectedLabels = select.selectedOptions.map((o) => hookOptions.getOptionLabel(o));

  const hasCascade = (option: TOption): boolean => {
    if (!hookOptions.cascade) return false;
    if (hookOptions.cascade.hasChildren) return hookOptions.cascade.hasChildren(option);
    return hookOptions.cascade.getChildren(option) !== null;
  };

  // Build the render function for each virtual item
  const renderItem = (vi: import('@tanstack/react-virtual').VirtualItem) => {
    const item = select.flattenedItems[vi.index];

    if (item.type === 'group-header') {
      return (
        <div
          key={vi.key}
          ref={select.measureElement}
          data-index={vi.index}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            transform: `translateY(${vi.start}px)`,
          }}
        >
          <GroupHeader label={item.groupLabel!} />
        </div>
      );
    }

    const option = item.option!;
    const value = hookOptions.getOptionValue(option);
    const label = hookOptions.getOptionLabel(option);
    const isSelected = select.selectedValues.includes(value);
    const isFocused = vi.index === select.focusedIndex;
    const optionAriaProps = select.getOptionProps(vi.index);

    return (
      <div
        key={vi.key}
        ref={select.measureElement}
        data-index={vi.index}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          transform: `translateY(${vi.start}px)`,
        }}
      >
        <OptionSlot
          item={item}
          option={option}
          label={label}
          value={value}
          isSelected={isSelected}
          isFocused={isFocused}
          isDisabled={item.disabled}
          hasCascade={hasCascade(option)}
          onClick={() => {
            if (item.disabled) return;
            if (hasCascade(option)) {
              select.openSubMenu(option);
              return;
            }
            if (hookOptions.multiple) {
              select.toggleValue(value);
            } else {
              select.selectValue(value);
            }
          }}
          ariaProps={optionAriaProps}
          dataAttributes={{
            'data-focused': isFocused || undefined,
            'data-selected': isSelected || undefined,
            'data-disabled': item.disabled || undefined,
            'data-value': value,
          }}
        />
      </div>
    );
  };

  return (
    <div
      ref={select.containerRef as React.RefObject<HTMLDivElement>}
      className={className}
      style={{ position: 'relative', ...style }}
      onKeyDown={select.handleKeyDown}
    >
      {/* Control — single input-like container: [tags? trigger | indicators] */}
      <div data-part="control" data-open={select.isOpen || undefined}>
        <div data-part="value-container">
          {/* Tags first, then trigger — they flow inline together */}
          {hookOptions.multiple &&
            select.selectedOptions.length > 0 &&
            select.selectedOptions.map((option) => {
              const value = hookOptions.getOptionValue(option);
              const label = hookOptions.getOptionLabel(option);
              return (
                <Tag
                  key={value}
                  label={label}
                  value={value}
                  onRemove={() => select.deselectValue(value)}
                />
              );
            })}
          <Trigger
            isOpen={select.isOpen}
            disabled={hookOptions.disabled ?? false}
            placeholder={hookOptions.placeholder ?? ''}
            searchable={hookOptions.searchable ?? false}
            searchValue={select.searchValue}
            multiple={hookOptions.multiple ?? false}
            selectedLabels={selectedLabels}
            onClick={select.toggle}
            triggerRef={select.triggerRef}
            ariaProps={select.getTriggerProps()}
          />
        </div>
        <div data-part="indicators">
          {select.selectedValues.length > 0 && <ClearIndicator onClick={select.clearAll} />}
          <DropdownIndicator isOpen={select.isOpen} />
        </div>
      </div>

      {/* Dropdown menu */}
      {select.isOpen && (
        <div
          data-part="menu"
          style={{
            maxHeight: menuHeight,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Search input inside the dropdown */}
          {hookOptions.searchable && (
            <Input
              value={select.searchValue}
              onChange={select.handleSearchInput}
              inputRef={select.inputRef}
              ariaProps={select.getInputProps()}
            />
          )}

          {select.isLoading ? (
            <Loading />
          ) : select.flattenedItems.length === 0 ? (
            <NoOptions searchValue={select.searchValue} />
          ) : (
            <MenuList
              menuRef={select.menuRef}
              virtualItems={select.virtualItems}
              totalSize={select.totalSize}
              measureElement={select.measureElement}
              renderItem={renderItem}
              ariaProps={select.getMenuProps()}
            />
          )}

          {/* Sub-menus */}
          {select.subMenus.map((subMenu) => (
            <SubMenuSlot
              key={subMenu.parentValue}
              subMenu={subMenu}
              getOptionLabel={hookOptions.getOptionLabel}
              getOptionValue={hookOptions.getOptionValue}
              onSelect={(value) => {
                if (hookOptions.multiple) {
                  select.toggleValue(value);
                } else {
                  select.selectValue(value);
                }
              }}
              onHover={() => {}}
              onOpenChild={(option) => select.openSubMenu(option)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
