import { useMemo } from 'react';
import { useVirtualSelect } from 'virtualized-ui';

interface City {
  id: string;
  name: string;
  country: string;
  timezone: string;
}

const CITY_NAMES = [
  'Tokyo',
  'Delhi',
  'Shanghai',
  'Mumbai',
  'São Paulo',
  'Beijing',
  'Cairo',
  'Dhaka',
  'Mexico City',
  'Osaka',
  'Karachi',
  'Chongqing',
  'Istanbul',
  'Buenos Aires',
  'Kolkata',
  'Lagos',
  'Kinshasa',
  'Manila',
  'Tianjin',
  'Guangzhou',
  'Rio de Janeiro',
  'Lahore',
  'Bangalore',
  'Shenzhen',
  'Moscow',
  'Chennai',
  'Bogotá',
  'Paris',
  'Jakarta',
  'Lima',
  'Bangkok',
  'Hyderabad',
  'Seoul',
  'Nagoya',
  'London',
  'Chengdu',
  'Nanjing',
  'Tehran',
  'Ho Chi Minh',
  'Luanda',
  'Ahmedabad',
  'Kuala Lumpur',
  'Hong Kong',
  'Hangzhou',
  'Surat',
  'Riyadh',
  'Baghdad',
  'Santiago',
  'Madrid',
  'Pune',
];
const COUNTRIES = [
  'JP',
  'IN',
  'CN',
  'BR',
  'EG',
  'BD',
  'MX',
  'PK',
  'TR',
  'AR',
  'NG',
  'CD',
  'PH',
  'RU',
  'CO',
  'FR',
  'ID',
  'PE',
  'TH',
  'KR',
  'GB',
  'IR',
  'VN',
  'AO',
  'MY',
  'HK',
  'SA',
  'IQ',
  'CL',
  'ES',
];
const TIMEZONES = [
  'UTC-12',
  'UTC-11',
  'UTC-10',
  'UTC-9',
  'UTC-8',
  'UTC-7',
  'UTC-6',
  'UTC-5',
  'UTC-4',
  'UTC-3',
  'UTC-2',
  'UTC-1',
  'UTC+0',
  'UTC+1',
  'UTC+2',
  'UTC+3',
  'UTC+4',
  'UTC+5',
  'UTC+5:30',
  'UTC+6',
  'UTC+7',
  'UTC+8',
  'UTC+9',
  'UTC+10',
  'UTC+11',
  'UTC+12',
];
const SUFFIXES = [
  '',
  'City',
  'Town',
  'Heights',
  'Springs',
  'Valley',
  'Junction',
  'Harbor',
  'Bay',
  'Point',
  'Park',
  'Gardens',
  'Hills',
  'Creek',
  'Crossing',
];

const generateCities = (count: number): City[] =>
  Array.from({ length: count }, (_, i) => {
    const baseName = CITY_NAMES[i % CITY_NAMES.length];
    const suffix = SUFFIXES[Math.floor(i / CITY_NAMES.length) % SUFFIXES.length];
    const num = Math.floor(i / (CITY_NAMES.length * SUFFIXES.length)) || '';
    const name = suffix
      ? `${baseName} ${suffix}${num ? ` ${num}` : ''}`
      : `${baseName}${num ? ` ${num}` : ''}`;
    return {
      id: `city-${i}`,
      name,
      country: COUNTRIES[i % COUNTRIES.length],
      timezone: TIMEZONES[i % TIMEZONES.length],
    };
  });

/** Sleek dark theme — type to filter 10k cities */
export function SelectSearchableDemo({ itemCount = 10000 }: { itemCount?: number }) {
  const cities = useMemo(() => generateCities(itemCount), [itemCount]);

  const select = useVirtualSelect<City>({
    options: cities,
    getOptionValue: (c) => c.id,
    getOptionLabel: (c) => `${c.name}, ${c.country}`,
    searchable: true,
    placeholder: 'Search cities...',
    filterOption: (option, input) =>
      option.name.toLowerCase().includes(input.toLowerCase()) ||
      option.country.toLowerCase().includes(input.toLowerCase()) ||
      option.timezone.toLowerCase().includes(input.toLowerCase()),
  });

  const selectedCity = select.selectedOptions[0];

  return (
    <div>
      <div
        ref={select.containerRef}
        onKeyDown={select.handleKeyDown}
        style={{ position: 'relative', width: '100%', maxWidth: 380 }}
      >
        {/* Trigger */}
        <button
          ref={select.triggerRef}
          type="button"
          onClick={select.toggle}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: '#0f172a',
            border: '1px solid #334155',
            borderRadius: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 15,
            color: selectedCity ? '#e2e8f0' : '#64748b',
            outline: 'none',
            transition: 'border-color 0.15s',
            ...(select.isOpen ? { borderColor: '#38bdf8' } : {}),
          }}
        >
          <span>
            {selectedCity ? `${selectedCity.name}, ${selectedCity.country}` : 'Search cities...'}
          </span>
          <span style={{ color: '#475569', fontSize: 14 }}>⌕</span>
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
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: 8,
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
              zIndex: 50,
              overflow: 'hidden',
            }}
          >
            {/* Search */}
            <div style={{ padding: '10px 12px', borderBottom: '1px solid #1e293b' }}>
              <input
                ref={select.inputRef}
                type="text"
                value={select.searchValue}
                onChange={(e) => select.handleSearchInput(e.target.value)}
                placeholder="Type to filter 10,000 cities..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 6,
                  fontSize: 14,
                  color: '#e2e8f0',
                  outline: 'none',
                }}
              />
            </div>

            {/* Options */}
            <div
              ref={select.menuRef}
              onKeyDown={select.handleMenuKeyDown}
              style={{ maxHeight: 280, overflow: 'auto', position: 'relative' }}
            >
              {select.flattenedItems.length === 0 ? (
                <div
                  style={{ padding: '20px', textAlign: 'center', color: '#475569', fontSize: 14 }}
                >
                  No cities match "{select.searchValue}"
                </div>
              ) : (
                <div style={{ height: select.totalSize, position: 'relative' }}>
                  {select.virtualItems.map((vi) => {
                    const item = select.flattenedItems[vi.index];
                    if (item.type !== 'option' || !item.option) return null;
                    const city = item.option;
                    const isSelected = select.selectedValues.includes(city.id);
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
                          onClick={() => select.selectValue(city.id)}
                          onMouseEnter={() => select.setFocusedIndex(vi.index)}
                          style={{
                            padding: '10px 14px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            background: isFocused
                              ? '#1e293b'
                              : isSelected
                                ? '#172554'
                                : 'transparent',
                            transition: 'background 0.1s',
                          }}
                        >
                          <div>
                            <span
                              style={{
                                fontSize: 14,
                                color: '#e2e8f0',
                                fontWeight: isSelected ? 600 : 400,
                              }}
                            >
                              {city.name}
                            </span>
                            <span style={{ fontSize: 13, color: '#64748b', marginLeft: 6 }}>
                              {city.country}
                            </span>
                          </div>
                          <span style={{ fontSize: 12, color: '#475569', fontFamily: 'monospace' }}>
                            {city.timezone}
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
      <p style={{ fontSize: 12, color: '#475569', marginTop: 10 }}>
        {itemCount.toLocaleString()} cities · Search by name, country, or timezone
      </p>
    </div>
  );
}
