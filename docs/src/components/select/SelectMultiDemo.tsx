import { useMemo } from 'react';
import { useVirtualSelect } from 'virtualized-ui';

interface Skill {
  id: string;
  name: string;
  color: string;
}

const CATEGORIES = [
  { prefix: 'React', color: '#61dafb' },
  { prefix: 'TypeScript', color: '#3178c6' },
  { prefix: 'Python', color: '#3776ab' },
  { prefix: 'Rust', color: '#dea584' },
  { prefix: 'Go', color: '#00add8' },
  { prefix: 'Vue', color: '#4fc08d' },
  { prefix: 'Angular', color: '#dd0031' },
  { prefix: 'Svelte', color: '#ff3e00' },
  { prefix: 'Node', color: '#339933' },
  { prefix: 'Docker', color: '#2496ed' },
  { prefix: 'AWS', color: '#ff9900' },
  { prefix: 'Tailwind', color: '#06b6d4' },
  { prefix: 'GraphQL', color: '#e10098' },
  { prefix: 'Redis', color: '#dc382d' },
  { prefix: 'Postgres', color: '#4169e1' },
  { prefix: 'MongoDB', color: '#47a248' },
  { prefix: 'Swift', color: '#f05138' },
  { prefix: 'Kotlin', color: '#7f52ff' },
  { prefix: 'Java', color: '#ed8b00' },
  { prefix: 'Ruby', color: '#cc342d' },
];
const SUFFIXES = [
  'Basics',
  'Advanced',
  'Testing',
  'Performance',
  'Security',
  'Patterns',
  'Architecture',
  'Deployment',
  'Monitoring',
  'CI/CD',
  'APIs',
  'CLI',
  'Debugging',
  'Profiling',
  'Concurrency',
  'Networking',
  'Storage',
  'Auth',
  'Caching',
  'Streaming',
  'Migration',
  'Scaling',
  'Refactoring',
  'Design',
  'Integration',
];

const generateSkills = (count: number): Skill[] =>
  Array.from({ length: count }, (_, i) => {
    const cat = CATEGORIES[i % CATEGORIES.length];
    const suffix = SUFFIXES[Math.floor(i / CATEGORIES.length) % SUFFIXES.length];
    const gen = Math.floor(i / (CATEGORIES.length * SUFFIXES.length)) || '';
    return {
      id: `skill-${i}`,
      name: `${cat.prefix} ${suffix}${gen ? ` ${gen}` : ''}`,
      color: cat.color,
    };
  });

/** Vibrant gradient accent — multi-select with colorful tags, 10k items */
export function SelectMultiDemo({ itemCount = 10000 }: { itemCount?: number }) {
  const skills = useMemo(() => generateSkills(itemCount), [itemCount]);

  const select = useVirtualSelect<Skill>({
    options: skills,
    getOptionValue: (s) => s.id,
    getOptionLabel: (s) => s.name,
    multiple: true,
    searchable: true,
    placeholder: 'Add skills...',
    closeOnSelect: false,
  });

  return (
    <div>
      <div
        ref={select.containerRef}
        onKeyDown={select.handleKeyDown}
        style={{ position: 'relative', width: '100%', maxWidth: 400 }}
      >
        {/* Control area */}
        <div
          onClick={select.toggle}
          style={{
            minHeight: 48,
            padding: '6px 12px',
            background: '#fff',
            border: '2px solid transparent',
            borderRadius: 12,
            cursor: 'pointer',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 6,
            backgroundImage: select.isOpen
              ? 'linear-gradient(#fff, #fff), linear-gradient(135deg, #667eea, #764ba2)'
              : 'linear-gradient(#fff, #fff), linear-gradient(135deg, #e2e8f0, #cbd5e1)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
            transition: 'all 0.2s',
          }}
        >
          {/* Tags */}
          {select.selectedOptions.map((skill) => (
            <span
              key={skill.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '3px 10px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 500,
                color: '#fff',
                background: skill.color,
              }}
            >
              {skill.name}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  select.deselectValue(skill.id);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.8)',
                  cursor: 'pointer',
                  padding: '0 2px',
                  fontSize: 14,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </span>
          ))}

          {/* Trigger */}
          <button
            ref={select.triggerRef}
            type="button"
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: 14,
              color: select.selectedOptions.length > 0 ? '#94a3b8' : '#64748b',
              outline: 'none',
              padding: '4px 0',
              flex: 1,
              minWidth: 80,
              textAlign: 'left',
            }}
          >
            {select.selectedOptions.length === 0 ? 'Add skills...' : '+'}
          </button>

          {select.selectedValues.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                select.clearAll();
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                fontSize: 16,
                padding: '0 4px',
              }}
            >
              ×
            </button>
          )}
        </div>

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
              borderRadius: 12,
              boxShadow: '0 10px 40px rgba(102,126,234,0.2)',
              border: '1px solid #e2e8f0',
              zIndex: 50,
              overflow: 'hidden',
            }}
          >
            {/* Search */}
            <div style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9' }}>
              <input
                ref={select.inputRef}
                type="text"
                value={select.searchValue}
                onChange={(e) => select.handleSearchInput(e.target.value)}
                placeholder="Filter 10,000 skills..."
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none',
                  background: '#fafafa',
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
                  No skills found
                </div>
              ) : (
                <div style={{ height: select.totalSize, position: 'relative' }}>
                  {select.virtualItems.map((vi) => {
                    const item = select.flattenedItems[vi.index];
                    if (item.type !== 'option' || !item.option) return null;
                    const skill = item.option;
                    const isSelected = select.selectedValues.includes(skill.id);
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
                          onClick={() => select.toggleValue(skill.id)}
                          onMouseEnter={() => select.setFocusedIndex(vi.index)}
                          style={{
                            padding: '9px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            cursor: 'pointer',
                            background: isFocused ? '#f8fafc' : 'transparent',
                            transition: 'background 0.1s',
                          }}
                        >
                          {/* Checkbox */}
                          <span
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: 4,
                              border: isSelected ? 'none' : '2px solid #cbd5e1',
                              background: isSelected
                                ? `linear-gradient(135deg, ${skill.color}, ${skill.color}dd)`
                                : '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              fontSize: 12,
                              color: '#fff',
                              transition: 'all 0.15s',
                            }}
                          >
                            {isSelected && '✓'}
                          </span>
                          {/* Color dot + name */}
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              background: skill.color,
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ fontSize: 14, color: '#334155' }}>{skill.name}</span>
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
        {select.selectedValues.length} of {itemCount.toLocaleString()} selected · Multi-select
      </p>
    </div>
  );
}
