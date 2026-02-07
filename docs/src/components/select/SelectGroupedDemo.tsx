import { useVirtualSelect } from 'virtualized-ui';
import type { OptionGroup } from 'virtualized-ui';

interface MenuItem {
  id: string;
  name: string;
  price: string;
}

const MENU_GROUPS: OptionGroup<MenuItem>[] = [
  {
    label: 'Appetizers',
    options: [
      { id: 'bruschetta', name: 'Bruschetta', price: '$8' },
      { id: 'calamari', name: 'Fried Calamari', price: '$12' },
      { id: 'soup', name: 'Soup of the Day', price: '$7' },
      { id: 'salad', name: 'Caesar Salad', price: '$10' },
      { id: 'hummus', name: 'Hummus Platter', price: '$9' },
    ],
  },
  {
    label: 'Main Courses',
    options: [
      { id: 'steak', name: 'Grilled Ribeye Steak', price: '$32' },
      { id: 'salmon', name: 'Pan-Seared Salmon', price: '$26' },
      { id: 'chicken', name: 'Roasted Chicken', price: '$22' },
      { id: 'pasta', name: 'Truffle Pasta', price: '$20' },
      { id: 'risotto', name: 'Mushroom Risotto', price: '$18' },
      { id: 'burger', name: 'Wagyu Burger', price: '$24' },
      { id: 'lamb', name: 'Lamb Chops', price: '$30' },
    ],
  },
  {
    label: 'Sides',
    options: [
      { id: 'fries', name: 'Truffle Fries', price: '$8' },
      { id: 'greens', name: 'Sautéed Greens', price: '$7' },
      { id: 'mashed', name: 'Mashed Potatoes', price: '$6' },
      { id: 'bread', name: 'Garlic Bread', price: '$5' },
    ],
  },
  {
    label: 'Desserts',
    options: [
      { id: 'tiramisu', name: 'Tiramisu', price: '$10' },
      { id: 'creme', name: 'Crème Brûlée', price: '$11' },
      { id: 'cake', name: 'Chocolate Lava Cake', price: '$12' },
      { id: 'gelato', name: 'Artisan Gelato', price: '$8' },
      { id: 'panna', name: 'Panna Cotta', price: '$9' },
    ],
  },
  {
    label: 'Beverages',
    options: [
      { id: 'espresso', name: 'Espresso', price: '$4' },
      { id: 'latte', name: 'Caffè Latte', price: '$5' },
      { id: 'juice', name: 'Fresh Orange Juice', price: '$6' },
      { id: 'wine', name: 'House Wine (glass)', price: '$12' },
      { id: 'beer', name: 'Craft Beer', price: '$8' },
      { id: 'water', name: 'Sparkling Water', price: '$3' },
    ],
  },
];

/** Warm earth-tone palette — grouped menu items with styled headers */
export function SelectGroupedDemo() {
  const select = useVirtualSelect<MenuItem>({
    options: MENU_GROUPS,
    getOptionValue: (m) => m.id,
    getOptionLabel: (m) => m.name,
    searchable: true,
    placeholder: "What's for dinner?",
  });

  const selectedItem = select.selectedOptions[0];

  return (
    <div>
      <div
        ref={select.containerRef}
        onKeyDown={select.handleKeyDown}
        style={{ position: 'relative', width: '100%', maxWidth: 370 }}
      >
        {/* Trigger */}
        <button
          ref={select.triggerRef}
          type="button"
          onClick={select.toggle}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: '#faf7f2',
            border: '1px solid #d6cfc4',
            borderRadius: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 15,
            color: selectedItem ? '#44403c' : '#a8a29e',
            outline: 'none',
            fontFamily: 'Georgia, serif',
            transition: 'border-color 0.15s',
            ...(select.isOpen ? { borderColor: '#a16207' } : {}),
          }}
        >
          <span>
            {selectedItem ? `${selectedItem.name} — ${selectedItem.price}` : "What's for dinner?"}
          </span>
          <span style={{ color: '#a8a29e', fontSize: 12 }}>{select.isOpen ? '▲' : '▼'}</span>
        </button>

        {/* Dropdown */}
        {select.isOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: 4,
              background: '#faf7f2',
              border: '1px solid #d6cfc4',
              borderRadius: 8,
              boxShadow: '0 8px 30px rgba(68,64,60,0.15)',
              zIndex: 50,
              overflow: 'hidden',
            }}
          >
            {/* Search */}
            <div style={{ padding: '10px 12px', borderBottom: '1px solid #e7e0d5' }}>
              <input
                ref={select.inputRef}
                type="text"
                value={select.searchValue}
                onChange={(e) => select.handleSearchInput(e.target.value)}
                placeholder="Search the menu..."
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: '#f5f0e8',
                  border: '1px solid #d6cfc4',
                  borderRadius: 6,
                  fontSize: 14,
                  color: '#44403c',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            {/* Options */}
            <div
              ref={select.menuRef}
              onKeyDown={select.handleMenuKeyDown}
              style={{ maxHeight: 300, overflow: 'auto', position: 'relative' }}
            >
              {select.flattenedItems.length === 0 ? (
                <div
                  style={{ padding: '20px', textAlign: 'center', color: '#a8a29e', fontSize: 14 }}
                >
                  Nothing on the menu matches
                </div>
              ) : (
                <div style={{ height: select.totalSize, position: 'relative' }}>
                  {select.virtualItems.map((vi) => {
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
                          <div
                            style={{
                              padding: '10px 14px 6px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                color: '#a16207',
                                fontFamily: 'Georgia, serif',
                              }}
                            >
                              {item.groupLabel}
                            </span>
                            <span
                              style={{
                                flex: 1,
                                height: 1,
                                background: 'linear-gradient(to right, #d6cfc4, transparent)',
                              }}
                            />
                          </div>
                        </div>
                      );
                    }

                    if (!item.option) return null;
                    const menuItem = item.option;
                    const isSelected = select.selectedValues.includes(menuItem.id);
                    const isFocused = vi.index === select.focusedIndex;

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
                        <div
                          onClick={() => select.selectValue(menuItem.id)}
                          onMouseEnter={() => select.setFocusedIndex(vi.index)}
                          style={{
                            padding: '8px 14px 8px 24px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            background: isFocused
                              ? '#f0ebe0'
                              : isSelected
                                ? '#ede8dc'
                                : 'transparent',
                            transition: 'background 0.1s',
                          }}
                        >
                          <span
                            style={{
                              fontSize: 14,
                              color: '#44403c',
                              fontWeight: isSelected ? 600 : 400,
                            }}
                          >
                            {menuItem.name}
                          </span>
                          <span
                            style={{
                              fontSize: 13,
                              color: '#78716c',
                              fontFamily: 'Georgia, serif',
                              fontStyle: 'italic',
                            }}
                          >
                            {menuItem.price}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <p style={{ fontSize: 12, color: '#a8a29e', marginTop: 10 }}>
        {MENU_GROUPS.reduce((n, g) => n + g.options.length, 0)} items in {MENU_GROUPS.length}{' '}
        categories
      </p>
    </div>
  );
}
