import { useMemo } from 'react';
import { useVirtualSelect } from 'virtualized-ui';

interface Country {
  code: string;
  name: string;
  flag: string;
}

const FLAGS = [
  '\u{1F1E6}\u{1F1F7}',
  '\u{1F1E6}\u{1F1FA}',
  '\u{1F1E6}\u{1F1F9}',
  '\u{1F1E7}\u{1F1EA}',
  '\u{1F1E7}\u{1F1F7}',
  '\u{1F1E8}\u{1F1E6}',
  '\u{1F1E8}\u{1F1F3}',
  '\u{1F1E9}\u{1F1EA}',
  '\u{1F1EA}\u{1F1F8}',
  '\u{1F1EB}\u{1F1F7}',
  '\u{1F1EC}\u{1F1E7}',
  '\u{1F1EE}\u{1F1F3}',
  '\u{1F1EE}\u{1F1F9}',
  '\u{1F1EF}\u{1F1F5}',
  '\u{1F1F0}\u{1F1F7}',
  '\u{1F1F2}\u{1F1FD}',
  '\u{1F1F3}\u{1F1F1}',
  '\u{1F1F3}\u{1F1F4}',
  '\u{1F1F5}\u{1F1F1}',
  '\u{1F1FA}\u{1F1F8}',
];
const PREFIXES = [
  'North',
  'South',
  'East',
  'West',
  'New',
  'Old',
  'Upper',
  'Lower',
  'Greater',
  'Lesser',
  'Central',
  'Inner',
  'Outer',
  'Grand',
  'Little',
  'Great',
  'Fort',
  'San',
  'Saint',
  'Mount',
];
const ROOTS = [
  'land',
  'burg',
  'ville',
  'ton',
  'shire',
  'berg',
  'ford',
  'port',
  'dale',
  'vale',
  'wood',
  'field',
  'haven',
  'ridge',
  'brook',
  'cliff',
  'stone',
  'gate',
  'holm',
  'wick',
  'stan',
  'mark',
  'nia',
  'sia',
  'lia',
  'ria',
  'tia',
  'via',
  'dia',
  'pia',
];

const generateCountries = (count: number): Country[] =>
  Array.from({ length: count }, (_, i) => {
    const prefix = PREFIXES[i % PREFIXES.length];
    const root = ROOTS[Math.floor(i / PREFIXES.length) % ROOTS.length];
    const suffix = Math.floor(i / (PREFIXES.length * ROOTS.length)) || '';
    return {
      code: `C${String(i).padStart(5, '0')}`,
      name: `${prefix}${root}${suffix ? ` ${suffix}` : ''}`,
      flag: FLAGS[i % FLAGS.length],
    };
  });

/** Clean modern card — subtle shadows, flag emojis, 10k items */
export function SelectBasicDemo({ itemCount = 10000 }: { itemCount?: number }) {
  const countries = useMemo(() => generateCountries(itemCount), [itemCount]);

  const select = useVirtualSelect<Country>({
    options: countries,
    getOptionValue: (c) => c.code,
    getOptionLabel: (c) => c.name,
    searchable: true,
    placeholder: 'Choose a country...',
  });

  const selectedCountry = select.selectedOptions[0];

  return (
    <div>
      <div
        ref={select.containerRef}
        onKeyDown={select.handleKeyDown}
        style={{ position: 'relative', width: '100%', maxWidth: 360 }}
      >
        {/* Trigger */}
        <button
          ref={select.triggerRef}
          type="button"
          onClick={select.toggle}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 15,
            color: selectedCountry ? '#1e293b' : '#94a3b8',
            transition: 'border-color 0.15s, box-shadow 0.15s',
            outline: 'none',
            ...(select.isOpen
              ? { borderColor: '#6366f1', boxShadow: '0 0 0 3px rgba(99,102,241,0.15)' }
              : {}),
          }}
        >
          <span>
            {selectedCountry
              ? `${selectedCountry.flag}  ${selectedCountry.name}`
              : 'Choose a country...'}
          </span>
          <span
            style={{
              color: '#94a3b8',
              fontSize: 12,
              transition: 'transform 0.2s',
              transform: select.isOpen ? 'rotate(180deg)' : 'rotate(0)',
            }}
          >
            ▼
          </span>
        </button>

        {/* Dropdown */}
        {select.isOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: 6,
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              zIndex: 50,
              overflow: 'hidden',
            }}
          >
            {/* Search input */}
            <div style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>
              <input
                ref={select.inputRef}
                type="text"
                value={select.searchValue}
                onChange={(e) => select.handleSearchInput(e.target.value)}
                placeholder="Search 10,000 countries..."
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  fontSize: 14,
                  outline: 'none',
                  background: '#f8fafc',
                }}
              />
            </div>

            {/* Options */}
            <div
              ref={select.menuRef}
              onKeyDown={select.handleMenuKeyDown}
              style={{ maxHeight: 260, overflow: 'auto', position: 'relative' }}
            >
              {select.flattenedItems.length === 0 ? (
                <div
                  style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}
                >
                  No countries found
                </div>
              ) : (
                <div style={{ height: select.totalSize, position: 'relative' }}>
                  {select.virtualItems.map((vi) => {
                    const item = select.flattenedItems[vi.index];
                    if (item.type !== 'option' || !item.option) return null;
                    const country = item.option;
                    const value = country.code;
                    const isSelected = select.selectedValues.includes(value);
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
                          onClick={() => select.selectValue(value)}
                          style={{
                            padding: '10px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            cursor: 'pointer',
                            fontSize: 14,
                            color: '#334155',
                            background: isFocused
                              ? '#f1f5f9'
                              : isSelected
                                ? '#eef2ff'
                                : 'transparent',
                            transition: 'background 0.1s',
                          }}
                          onMouseEnter={() => select.setFocusedIndex(vi.index)}
                        >
                          <span style={{ fontSize: 20, lineHeight: 1 }}>{country.flag}</span>
                          <span style={{ fontWeight: isSelected ? 600 : 400 }}>{country.name}</span>
                          {isSelected && (
                            <span style={{ marginLeft: 'auto', color: '#6366f1', fontSize: 16 }}>
                              ✓
                            </span>
                          )}
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
      <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 10 }}>
        {itemCount.toLocaleString()} items · Single select · Virtualized
      </p>
    </div>
  );
}
