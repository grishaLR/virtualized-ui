import { useVirtualSelect } from 'virtualized-ui';
import type { AsyncConfig } from 'virtualized-ui';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

const ALL_USERS: User[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@acme.com', role: 'Engineering', avatar: 'AJ' },
  { id: '2', name: 'Bob Chen', email: 'bob@acme.com', role: 'Design', avatar: 'BC' },
  { id: '3', name: 'Carol Williams', email: 'carol@acme.com', role: 'Product', avatar: 'CW' },
  { id: '4', name: 'David Kim', email: 'david@acme.com', role: 'Engineering', avatar: 'DK' },
  { id: '5', name: 'Emma Davis', email: 'emma@acme.com', role: 'Marketing', avatar: 'ED' },
  { id: '6', name: 'Frank Miller', email: 'frank@acme.com', role: 'Sales', avatar: 'FM' },
  { id: '7', name: 'Grace Lee', email: 'grace@acme.com', role: 'Engineering', avatar: 'GL' },
  { id: '8', name: 'Henry Taylor', email: 'henry@acme.com', role: 'Design', avatar: 'HT' },
  { id: '9', name: 'Iris Patel', email: 'iris@acme.com', role: 'Product', avatar: 'IP' },
  { id: '10', name: 'James Brown', email: 'james@acme.com', role: 'Engineering', avatar: 'JB' },
  { id: '11', name: 'Karen White', email: 'karen@acme.com', role: 'Marketing', avatar: 'KW' },
  { id: '12', name: 'Leo Garcia', email: 'leo@acme.com', role: 'Sales', avatar: 'LG' },
  { id: '13', name: 'Maria Rodriguez', email: 'maria@acme.com', role: 'Engineering', avatar: 'MR' },
  { id: '14', name: 'Nathan Park', email: 'nathan@acme.com', role: 'Design', avatar: 'NP' },
  { id: '15', name: 'Olivia Scott', email: 'olivia@acme.com', role: 'Product', avatar: 'OS' },
  { id: '16', name: 'Peter Zhang', email: 'peter@acme.com', role: 'Engineering', avatar: 'PZ' },
  { id: '17', name: 'Quinn Adams', email: 'quinn@acme.com', role: 'Marketing', avatar: 'QA' },
  { id: '18', name: 'Rachel Evans', email: 'rachel@acme.com', role: 'Sales', avatar: 'RE' },
  { id: '19', name: 'Sam Wilson', email: 'sam@acme.com', role: 'Engineering', avatar: 'SW' },
  { id: '20', name: 'Tina Liu', email: 'tina@acme.com', role: 'Design', avatar: 'TL' },
];

const ROLE_COLORS: Record<string, string> = {
  Engineering: '#3b82f6',
  Design: '#ec4899',
  Product: '#8b5cf6',
  Marketing: '#f59e0b',
  Sales: '#10b981',
};

const asyncConfig: AsyncConfig<User> = {
  loadOptions: async (inputValue: string) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));
    if (!inputValue) return ALL_USERS;
    const lower = inputValue.toLowerCase();
    return ALL_USERS.filter(
      (u) =>
        u.name.toLowerCase().includes(lower) ||
        u.email.toLowerCase().includes(lower) ||
        u.role.toLowerCase().includes(lower)
    );
  },
  debounceMs: 300,
  loadOnOpen: true,
  cacheTtlMs: 30000,
};

/** Professional enterprise-style — async loading with avatars */
export function SelectAsyncDemo() {
  const select = useVirtualSelect<User>({
    getOptionValue: (u) => u.id,
    getOptionLabel: (u) => u.name,
    async: asyncConfig,
    searchable: true,
    placeholder: 'Search team members...',
  });

  const selectedUser = select.selectedOptions[0];

  return (
    <div>
      <div
        ref={select.containerRef}
        onKeyDown={select.handleKeyDown}
        style={{ position: 'relative', width: '100%', maxWidth: 400 }}
      >
        {/* Trigger */}
        <button
          ref={select.triggerRef}
          type="button"
          onClick={select.toggle}
          style={{
            width: '100%',
            padding: '10px 14px',
            background: '#fff',
            border: '1px solid #d1d5db',
            borderRadius: 6,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 14,
            color: selectedUser ? '#111827' : '#9ca3af',
            outline: 'none',
            transition: 'border-color 0.15s, box-shadow 0.15s',
            ...(select.isOpen
              ? { borderColor: '#2563eb', boxShadow: '0 0 0 2px rgba(37,99,235,0.15)' }
              : {}),
          }}
        >
          {selectedUser ? (
            <>
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: ROLE_COLORS[selectedUser.role] || '#6b7280',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {selectedUser.avatar}
              </span>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontWeight: 500 }}>{selectedUser.name}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{selectedUser.email}</div>
              </div>
            </>
          ) : (
            <span>Search team members...</span>
          )}
          <span style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: 12 }}>
            {select.isOpen ? '▲' : '▼'}
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
              marginTop: 4,
              background: '#fff',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              zIndex: 50,
              overflow: 'hidden',
            }}
          >
            {/* Search */}
            <div style={{ padding: '8px 10px', borderBottom: '1px solid #e5e7eb' }}>
              <input
                ref={select.inputRef}
                type="text"
                value={select.searchValue}
                onChange={(e) => select.handleSearchInput(e.target.value)}
                placeholder="Search by name, email, or role..."
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 4,
                  fontSize: 13,
                  color: '#111827',
                  outline: 'none',
                  background: '#f9fafb',
                }}
              />
            </div>

            {/* Options */}
            <div
              ref={select.menuRef}
              onKeyDown={select.handleMenuKeyDown}
              style={{ maxHeight: 280, overflow: 'auto', position: 'relative' }}
            >
              {select.isLoading ? (
                <div style={{ padding: '24px', textAlign: 'center' }}>
                  <div
                    style={{
                      display: 'inline-block',
                      width: 20,
                      height: 20,
                      border: '2px solid #e5e7eb',
                      borderTopColor: '#2563eb',
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite',
                    }}
                  />
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  <p style={{ fontSize: 13, color: '#6b7280', marginTop: 8 }}>Searching...</p>
                </div>
              ) : select.flattenedItems.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center' }}>
                  <p style={{ fontSize: 14, color: '#6b7280' }}>No team members found</p>
                  <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                    Try a different search term
                  </p>
                </div>
              ) : (
                <div style={{ height: select.totalSize, position: 'relative' }}>
                  {select.virtualItems.map((vi) => {
                    const item = select.flattenedItems[vi.index];
                    if (item.type !== 'option' || !item.option) return null;
                    const user = item.option;
                    const isSelected = select.selectedValues.includes(user.id);
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
                          onClick={() => select.selectValue(user.id)}
                          onMouseEnter={() => select.setFocusedIndex(vi.index)}
                          style={{
                            padding: '8px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            cursor: 'pointer',
                            background: isFocused
                              ? '#f3f4f6'
                              : isSelected
                                ? '#eff6ff'
                                : 'transparent',
                            transition: 'background 0.1s',
                          }}
                        >
                          {/* Avatar */}
                          <span
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: ROLE_COLORS[user.role] || '#6b7280',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 12,
                              fontWeight: 600,
                              flexShrink: 0,
                            }}
                          >
                            {user.avatar}
                          </span>
                          {/* Info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: 14,
                                color: '#111827',
                                fontWeight: isSelected ? 600 : 400,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {user.name}
                            </div>
                            <div style={{ fontSize: 12, color: '#6b7280' }}>{user.email}</div>
                          </div>
                          {/* Role badge */}
                          <span
                            style={{
                              fontSize: 11,
                              padding: '2px 8px',
                              borderRadius: 10,
                              background: `${ROLE_COLORS[user.role]}15`,
                              color: ROLE_COLORS[user.role],
                              fontWeight: 500,
                              flexShrink: 0,
                            }}
                          >
                            {user.role}
                          </span>
                          {isSelected && (
                            <span style={{ color: '#2563eb', fontSize: 14, flexShrink: 0 }}>✓</span>
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
      <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 10 }}>
        Async loading with 300ms debounce · Cached for 30s
      </p>
    </div>
  );
}
