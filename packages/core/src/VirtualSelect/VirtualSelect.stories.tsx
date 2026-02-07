import { useMemo, useState, useCallback } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { VirtualSelect } from './VirtualSelect';
import { useVirtualSelect } from './useVirtualSelect';
import type { OptionGroup } from './types';

// --- Mock data ---

interface User {
  id: string;
  name: string;
  role: string;
}

function generateUsers(count: number): User[] {
  const names = [
    'Alice Chen',
    'Bob Martinez',
    'Carol Davis',
    'Dan Wilson',
    'Eva Brown',
    'Frank Lee',
    'Grace Kim',
    'Henry Patel',
    'Iris Johnson',
    'Jack Thompson',
    'Kate Moore',
    'Leo Garcia',
    'Mia Anderson',
    'Noah White',
    'Olivia Taylor',
    'Peter Jackson',
    'Quinn Harris',
    'Ruby Clark',
    'Sam Lewis',
    'Tina Walker',
  ];
  const roles = ['Engineer', 'Designer', 'PM', 'QA', 'DevOps', 'Data Scientist'];

  return Array.from({ length: count }, (_, i) => ({
    id: `user-${i}`,
    name: `${names[i % names.length]}${i >= names.length ? ` ${Math.floor(i / names.length) + 1}` : ''}`,
    role: roles[i % roles.length],
  }));
}

const groupedUsers: OptionGroup<User>[] = [
  {
    label: 'Engineering',
    options: [
      { id: 'eng-1', name: 'Alice Chen', role: 'Engineer' },
      { id: 'eng-2', name: 'Bob Martinez', role: 'Engineer' },
      { id: 'eng-3', name: 'Carol Davis', role: 'Engineer' },
      { id: 'eng-4', name: 'Dan Wilson', role: 'Engineer' },
    ],
  },
  {
    label: 'Design',
    options: [
      { id: 'des-1', name: 'Eva Brown', role: 'Designer' },
      { id: 'des-2', name: 'Frank Lee', role: 'Designer' },
    ],
  },
  {
    label: 'Product',
    options: [
      { id: 'pm-1', name: 'Grace Kim', role: 'PM' },
      { id: 'pm-2', name: 'Henry Patel', role: 'PM' },
      { id: 'pm-3', name: 'Iris Johnson', role: 'PM' },
    ],
  },
];

interface Category {
  id: string;
  name: string;
  children?: Category[];
}

const categories: Category[] = [
  {
    id: 'tech',
    name: 'Technology',
    children: [
      {
        id: 'frontend',
        name: 'Frontend',
        children: [
          { id: 'react', name: 'React' },
          { id: 'vue', name: 'Vue' },
          { id: 'svelte', name: 'Svelte' },
        ],
      },
      {
        id: 'backend',
        name: 'Backend',
        children: [
          { id: 'node', name: 'Node.js' },
          { id: 'python', name: 'Python' },
          { id: 'go', name: 'Go' },
        ],
      },
    ],
  },
  {
    id: 'design',
    name: 'Design',
    children: [
      { id: 'ui', name: 'UI Design' },
      { id: 'ux', name: 'UX Research' },
      { id: 'branding', name: 'Branding' },
    ],
  },
  { id: 'marketing', name: 'Marketing' },
];

const getOptionValue = (u: User) => u.id;
const getOptionLabel = (u: User) => u.name;

// --- Styles ---

const containerStyle: React.CSSProperties = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  maxWidth: 400,
  margin: '0 auto',
};

const selectStyles = `
  .vs-root {
    position: relative;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  /* ---- Control: bordered shell ---- */
  .vs-root [data-part="control"] {
    display: flex;
    align-items: stretch;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background: white;
    min-height: 38px;
    cursor: pointer;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .vs-root [data-part="control"]:hover {
    border-color: #9ca3af;
  }
  .vs-root [data-part="control"][data-open] {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59,130,246,0.2);
  }

  /* Value container: tags + trigger flow inline together */
  .vs-root [data-part="value-container"] {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 3px;
    flex: 1;
    min-width: 0;
    padding: 4px 4px 4px 8px;
    max-height: 80px;
    overflow-y: auto;
  }

  /* Tags — inline chips */
  .vs-root [data-part="value-container"] > span[data-value] {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 2px 6px;
    background: #dbeafe;
    border-radius: 4px;
    font-size: 13px;
    line-height: 1.4;
    white-space: nowrap;
    max-width: 160px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .vs-root [data-part="value-container"] > span[data-value] button {
    border: none;
    background: none;
    cursor: pointer;
    color: #6b7280;
    font-size: 14px;
    padding: 0 1px;
    line-height: 1;
    flex-shrink: 0;
  }
  .vs-root [data-part="value-container"] > span[data-value] button:hover {
    color: #ef4444;
  }

  /* Trigger button — grows to fill remaining space */
  .vs-root button[role="combobox"] {
    flex: 1 1 60px;
    min-width: 60px;
    padding: 4px;
    border: none;
    background: none;
    cursor: pointer;
    text-align: left;
    font-size: 14px;
    color: #374151;
    outline: none;
    font-family: inherit;
    line-height: 1.4;
  }
  .vs-root button[role="combobox"][data-placeholder] {
    color: #9ca3af;
  }
  .vs-root button[role="combobox"]:disabled {
    color: #9ca3af;
    cursor: not-allowed;
  }

  /* Indicators — pinned right */
  .vs-root [data-part="indicators"] {
    display: flex;
    align-items: center;
    padding: 0 8px 0 4px;
    gap: 2px;
    flex-shrink: 0;
    align-self: center;
  }
  .vs-root [data-part="indicators"] button {
    border: none;
    background: none;
    cursor: pointer;
    color: #9ca3af;
    font-size: 14px;
    padding: 2px;
    line-height: 1;
    display: flex;
    align-items: center;
  }
  .vs-root [data-part="indicators"] button:hover {
    color: #374151;
  }
  .vs-root [data-part="indicators"] > span {
    font-size: 10px;
    color: #9ca3af;
    display: flex;
    align-items: center;
    padding: 2px;
  }

  /* ---- Dropdown menu ---- */
  .vs-root [data-part="menu"] {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    z-index: 50;
  }

  /* Search input */
  .vs-root input[role="searchbox"] {
    width: 100%;
    padding: 8px 12px;
    border: none;
    border-bottom: 1px solid #e5e7eb;
    outline: none;
    font-size: 14px;
    box-sizing: border-box;
    flex-shrink: 0;
  }

  /* Option rows */
  .vs-root [role="listbox"] [data-value] {
    padding: 8px 12px;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .vs-root [role="listbox"] [data-value]:hover,
  .vs-root [role="listbox"] [data-focused="true"] {
    background: #eff6ff;
  }
  .vs-root [role="listbox"] [data-selected="true"] {
    background: #dbeafe;
    font-weight: 500;
  }
  .vs-root [role="listbox"] [data-disabled="true"] {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Group headers */
  .vs-root [role="presentation"] {
    padding: 8px 12px 4px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #6b7280;
  }

  /* No options / loading */
  .vs-root [data-part="menu"] > div:not([role]) {
    padding: 12px;
    color: #9ca3af;
    text-align: center;
    font-size: 14px;
  }

  .vs-info {
    margin-top: 12px;
    padding: 8px 12px;
    background: #f9fafb;
    border-radius: 6px;
    font-size: 13px;
    color: #6b7280;
  }
`;

// --- Story meta ---

const meta: Meta<typeof VirtualSelect> = {
  title: 'Components/VirtualSelect',
  component: VirtualSelect as Meta<typeof VirtualSelect>['component'],
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// --- Stories ---

export const Basic: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    const users = useMemo(() => generateUsers(100), []);

    return (
      <div style={containerStyle}>
        <style>{selectStyles}</style>
        <h3 style={{ marginBottom: 12 }}>Single Select</h3>
        <VirtualSelect
          options={users}
          getOptionValue={getOptionValue}
          getOptionLabel={getOptionLabel}
          value={value}
          onValueChange={setValue}
          placeholder="Select a user..."
          className="vs-root"
        />
        <div className="vs-info">Selected: {value.length > 0 ? value[0] : 'none'}</div>
      </div>
    );
  },
};

export const Searchable: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    const users = useMemo(() => generateUsers(1000), []);

    return (
      <div style={containerStyle}>
        <style>{selectStyles}</style>
        <h3 style={{ marginBottom: 12 }}>Searchable Select (1,000 items)</h3>
        <VirtualSelect
          options={users}
          getOptionValue={getOptionValue}
          getOptionLabel={getOptionLabel}
          value={value}
          onValueChange={setValue}
          searchable
          placeholder="Search users..."
          className="vs-root"
        />
        <div className="vs-info">Selected: {value.length > 0 ? value[0] : 'none'}</div>
      </div>
    );
  },
};

export const MultiSelect: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    const users = useMemo(() => generateUsers(200), []);

    return (
      <div style={containerStyle}>
        <style>{selectStyles}</style>
        <h3 style={{ marginBottom: 12 }}>Multi Select + Search</h3>
        <VirtualSelect
          options={users}
          getOptionValue={getOptionValue}
          getOptionLabel={getOptionLabel}
          value={value}
          onValueChange={setValue}
          multiple
          searchable
          placeholder="Add users..."
          className="vs-root"
        />
        <div className="vs-info">
          Selected ({value.length}): {value.join(', ') || 'none'}
        </div>
      </div>
    );
  },
};

export const GroupedOptions: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([]);

    return (
      <div style={containerStyle}>
        <style>{selectStyles}</style>
        <h3 style={{ marginBottom: 12 }}>Grouped Options</h3>
        <VirtualSelect
          options={groupedUsers}
          getOptionValue={getOptionValue}
          getOptionLabel={getOptionLabel}
          value={value}
          onValueChange={setValue}
          searchable
          placeholder="Select team member..."
          className="vs-root"
        />
        <div className="vs-info">Selected: {value.length > 0 ? value[0] : 'none'}</div>
      </div>
    );
  },
};

export const AsyncLoading: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    const allUsers = useMemo(() => generateUsers(500), []);

    const loadOptions = useCallback(
      async (input: string) => {
        // Simulate network delay
        await new Promise((r) => setTimeout(r, 400));
        if (!input) return allUsers.slice(0, 20);
        return allUsers.filter((u) => u.name.toLowerCase().includes(input.toLowerCase()));
      },
      [allUsers]
    );

    return (
      <div style={containerStyle}>
        <style>{selectStyles}</style>
        <h3 style={{ marginBottom: 12 }}>Async Loading</h3>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
          Options load asynchronously with 400ms simulated latency. Results are debounced and
          cached.
        </p>
        <VirtualSelect
          getOptionValue={getOptionValue}
          getOptionLabel={getOptionLabel}
          value={value}
          onValueChange={setValue}
          searchable
          async={{
            loadOptions,
            debounceMs: 250,
            cacheTtlMs: 10000,
          }}
          placeholder="Search users (async)..."
          className="vs-root"
        />
        <div className="vs-info">Selected: {value.length > 0 ? value[0] : 'none'}</div>
      </div>
    );
  },
};

export const WithDisabledOptions: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    const users = useMemo(() => generateUsers(50), []);

    return (
      <div style={containerStyle}>
        <style>{selectStyles}</style>
        <h3 style={{ marginBottom: 12 }}>With Disabled Options</h3>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
          Every 3rd option is disabled. Keyboard navigation skips disabled items.
        </p>
        <VirtualSelect
          options={users}
          getOptionValue={getOptionValue}
          getOptionLabel={getOptionLabel}
          value={value}
          onValueChange={setValue}
          isOptionDisabled={(_) => {
            const idx = users.indexOf(_);
            return idx % 3 === 2;
          }}
          placeholder="Select a user..."
          className="vs-root"
        />
        <div className="vs-info">Selected: {value.length > 0 ? value[0] : 'none'}</div>
      </div>
    );
  },
};

export const CascadeSubMenus: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([]);

    return (
      <div style={containerStyle}>
        <style>
          {selectStyles}
          {`
          .vs-root [role="listbox"][style*="left: 100%"] {
            position: absolute;
            min-width: 180px;
            background: white;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          .vs-root [role="listbox"][style*="left: 100%"] [role="option"] {
            padding: 8px 12px;
            cursor: pointer;
            font-size: 14px;
          }
          .vs-root [role="listbox"][style*="left: 100%"] [role="option"]:hover,
          .vs-root [role="listbox"][style*="left: 100%"] [data-focused="true"] {
            background: #eff6ff;
          }
        `}
        </style>
        <h3 style={{ marginBottom: 12 }}>Cascade Sub-Menus</h3>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
          Use ArrowRight to open sub-menus, ArrowLeft/Escape to close them.
        </p>
        <VirtualSelect
          options={categories}
          getOptionValue={(c: Category) => c.id}
          getOptionLabel={(c: Category) => c.name}
          value={value}
          onValueChange={setValue}
          cascade={{
            getChildren: (c: Category) => c.children ?? null,
            hasChildren: (c: Category) => !!c.children && c.children.length > 0,
          }}
          placeholder="Select a category..."
          className="vs-root"
        />
        <div className="vs-info">Selected: {value.length > 0 ? value[0] : 'none'}</div>
      </div>
    );
  },
};

export const HookOnly: Story = {
  render: () => {
    const users = useMemo(() => generateUsers(200), []);
    const [value, setValue] = useState<string[]>([]);

    const select = useVirtualSelect({
      options: users,
      getOptionValue,
      getOptionLabel,
      value,
      onValueChange: setValue,
      searchable: true,
    });

    return (
      <div style={containerStyle}>
        <style>{`
          .hook-trigger {
            width: 100%;
            padding: 8px 12px;
            border: 2px solid ${select.isOpen ? '#8b5cf6' : '#d1d5db'};
            border-radius: 8px;
            background: white;
            cursor: pointer;
            text-align: left;
            font-size: 14px;
          }
          .hook-menu {
            position: absolute;
            top: calc(100% + 4px);
            left: 0;
            right: 0;
            background: white;
            border: 2px solid #8b5cf6;
            border-radius: 8px;
            box-shadow: 0 8px 24px rgba(139,92,246,0.15);
            overflow: hidden;
          }
          .hook-input {
            width: 100%;
            padding: 10px 12px;
            border: none;
            border-bottom: 1px solid #e5e7eb;
            outline: none;
            font-size: 14px;
            box-sizing: border-box;
          }
          .hook-option {
            padding: 8px 12px;
            cursor: pointer;
            font-size: 14px;
          }
          .hook-option:hover, .hook-option.focused {
            background: #f5f3ff;
          }
          .hook-option.selected {
            background: #ede9fe;
            color: #7c3aed;
            font-weight: 500;
          }
          .hook-option .role {
            font-size: 12px;
            color: #9ca3af;
            margin-left: 8px;
          }
        `}</style>
        <h3 style={{ marginBottom: 12 }}>Hook-Only (Custom Rendering)</h3>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
          Uses <code>useVirtualSelect</code> directly with fully custom UI.
        </p>
        <div style={{ position: 'relative' }} onKeyDown={select.handleKeyDown}>
          <button
            ref={select.triggerRef as React.RefObject<HTMLButtonElement>}
            onClick={select.toggle}
            className="hook-trigger"
            {...select.getTriggerProps()}
          >
            {select.selectedOptions.length > 0
              ? getOptionLabel(select.selectedOptions[0])
              : 'Pick a user...'}
          </button>

          {select.isOpen && (
            <div className="hook-menu" style={{ maxHeight: 300 }}>
              <input
                ref={select.inputRef as React.RefObject<HTMLInputElement>}
                className="hook-input"
                value={select.searchValue}
                onChange={(e) => select.handleSearchInput(e.target.value)}
                placeholder="Type to search..."
                {...select.getInputProps()}
              />
              <div
                ref={select.menuRef as React.RefObject<HTMLDivElement>}
                style={{ maxHeight: 250, overflow: 'auto', position: 'relative' }}
                {...select.getMenuProps()}
              >
                <div style={{ height: select.totalSize, position: 'relative' }}>
                  {select.virtualItems.map((vi) => {
                    const item = select.flattenedItems[vi.index];
                    if (item.type !== 'option' || !item.option) return null;
                    const user = item.option;
                    const val = getOptionValue(user);
                    const isSelected = select.selectedValues.includes(val);
                    const isFocused = vi.index === select.focusedIndex;
                    return (
                      <div
                        key={vi.key}
                        ref={select.measureElement}
                        data-index={vi.index}
                        className={`hook-option${isFocused ? ' focused' : ''}${isSelected ? ' selected' : ''}`}
                        onClick={() => select.selectValue(val)}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          transform: `translateY(${vi.start}px)`,
                        }}
                        {...select.getOptionProps(vi.index)}
                      >
                        {user.name}
                        <span className="role">{user.role}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {select.flattenedItems.length === 0 && (
                <div style={{ padding: '12px', color: '#9ca3af', textAlign: 'center' }}>
                  No results
                </div>
              )}
            </div>
          )}
        </div>

        <div
          className="vs-info"
          style={{
            marginTop: 12,
            padding: '8px 12px',
            background: '#f9fafb',
            borderRadius: 6,
            fontSize: 13,
            color: '#6b7280',
          }}
        >
          Selected: {value.length > 0 ? value[0] : 'none'}
        </div>
      </div>
    );
  },
};

export const TenThousandOptions: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    const users = useMemo(() => generateUsers(10000), []);

    return (
      <div style={containerStyle}>
        <style>{selectStyles}</style>
        <h3 style={{ marginBottom: 12 }}>10,000 Options</h3>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
          Virtualized rendering keeps the dropdown smooth even with 10k items.
        </p>
        <VirtualSelect
          options={users}
          getOptionValue={getOptionValue}
          getOptionLabel={getOptionLabel}
          value={value}
          onValueChange={setValue}
          searchable
          placeholder="Search 10,000 users..."
          className="vs-root"
        />
        <div className="vs-info">Selected: {value.length > 0 ? value[0] : 'none'}</div>
      </div>
    );
  },
};
