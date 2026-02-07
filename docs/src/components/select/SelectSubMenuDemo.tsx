import { useVirtualSelect } from 'virtualized-ui';
import type { CascadeConfig } from 'virtualized-ui';

interface FileNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  icon: string;
}

// A simulated file tree
const ROOT_ITEMS: FileNode[] = [
  { id: 'src', name: 'src', type: 'folder', icon: '\u{1F4C1}' },
  { id: 'docs', name: 'docs', type: 'folder', icon: '\u{1F4C1}' },
  { id: 'tests', name: 'tests', type: 'folder', icon: '\u{1F4C1}' },
  { id: 'config', name: 'config', type: 'folder', icon: '\u{1F4C1}' },
  { id: 'scripts', name: 'scripts', type: 'folder', icon: '\u{1F4C1}' },
  { id: 'readme', name: 'README.md', type: 'file', icon: '\u{1F4C4}' },
  { id: 'pkg', name: 'package.json', type: 'file', icon: '\u{1F4C4}' },
  { id: 'tsconfig', name: 'tsconfig.json', type: 'file', icon: '\u{1F4C4}' },
  { id: 'license', name: 'LICENSE', type: 'file', icon: '\u{1F4C4}' },
];

const CHILDREN: Record<string, FileNode[]> = {
  src: [
    { id: 'src/components', name: 'components', type: 'folder', icon: '\u{1F4C1}' },
    { id: 'src/hooks', name: 'hooks', type: 'folder', icon: '\u{1F4C1}' },
    { id: 'src/utils', name: 'utils', type: 'folder', icon: '\u{1F4C1}' },
    { id: 'src/types', name: 'types', type: 'folder', icon: '\u{1F4C1}' },
    { id: 'src/index.ts', name: 'index.ts', type: 'file', icon: '\u{1F4C4}' },
    { id: 'src/app.tsx', name: 'App.tsx', type: 'file', icon: '\u{1F4C4}' },
    { id: 'src/main.tsx', name: 'main.tsx', type: 'file', icon: '\u{1F4C4}' },
  ],
  docs: [
    { id: 'docs/guide', name: 'guide', type: 'folder', icon: '\u{1F4C1}' },
    { id: 'docs/api', name: 'api', type: 'folder', icon: '\u{1F4C1}' },
    { id: 'docs/intro.md', name: 'intro.md', type: 'file', icon: '\u{1F4C4}' },
    { id: 'docs/faq.md', name: 'faq.md', type: 'file', icon: '\u{1F4C4}' },
  ],
  tests: [
    { id: 'tests/unit', name: 'unit', type: 'folder', icon: '\u{1F4C1}' },
    { id: 'tests/e2e', name: 'e2e', type: 'folder', icon: '\u{1F4C1}' },
    { id: 'tests/setup.ts', name: 'setup.ts', type: 'file', icon: '\u{1F4C4}' },
  ],
  config: [
    { id: 'config/vite.ts', name: 'vite.config.ts', type: 'file', icon: '\u{1F4C4}' },
    { id: 'config/eslint.json', name: '.eslintrc.json', type: 'file', icon: '\u{1F4C4}' },
    { id: 'config/prettier.json', name: '.prettierrc', type: 'file', icon: '\u{1F4C4}' },
  ],
  scripts: [
    { id: 'scripts/build.sh', name: 'build.sh', type: 'file', icon: '\u{1F4C4}' },
    { id: 'scripts/deploy.sh', name: 'deploy.sh', type: 'file', icon: '\u{1F4C4}' },
    { id: 'scripts/test.sh', name: 'test.sh', type: 'file', icon: '\u{1F4C4}' },
  ],
  'src/components': [
    { id: 'src/components/Button.tsx', name: 'Button.tsx', type: 'file', icon: '\u{1F4C4}' },
    { id: 'src/components/Modal.tsx', name: 'Modal.tsx', type: 'file', icon: '\u{1F4C4}' },
    { id: 'src/components/Select.tsx', name: 'Select.tsx', type: 'file', icon: '\u{1F4C4}' },
    { id: 'src/components/Table.tsx', name: 'Table.tsx', type: 'file', icon: '\u{1F4C4}' },
    { id: 'src/components/Input.tsx', name: 'Input.tsx', type: 'file', icon: '\u{1F4C4}' },
  ],
  'src/hooks': [
    { id: 'src/hooks/useAuth.ts', name: 'useAuth.ts', type: 'file', icon: '\u{1F4C4}' },
    { id: 'src/hooks/useForm.ts', name: 'useForm.ts', type: 'file', icon: '\u{1F4C4}' },
    { id: 'src/hooks/useQuery.ts', name: 'useQuery.ts', type: 'file', icon: '\u{1F4C4}' },
  ],
  'src/utils': [
    { id: 'src/utils/format.ts', name: 'format.ts', type: 'file', icon: '\u{1F4C4}' },
    { id: 'src/utils/validate.ts', name: 'validate.ts', type: 'file', icon: '\u{1F4C4}' },
    { id: 'src/utils/api.ts', name: 'api.ts', type: 'file', icon: '\u{1F4C4}' },
  ],
  'src/types': [
    { id: 'src/types/index.ts', name: 'index.ts', type: 'file', icon: '\u{1F4C4}' },
    { id: 'src/types/api.ts', name: 'api.ts', type: 'file', icon: '\u{1F4C4}' },
  ],
  'docs/guide': [
    {
      id: 'docs/guide/getting-started.md',
      name: 'getting-started.md',
      type: 'file',
      icon: '\u{1F4C4}',
    },
    { id: 'docs/guide/advanced.md', name: 'advanced.md', type: 'file', icon: '\u{1F4C4}' },
  ],
  'docs/api': [
    { id: 'docs/api/hooks.md', name: 'hooks.md', type: 'file', icon: '\u{1F4C4}' },
    { id: 'docs/api/components.md', name: 'components.md', type: 'file', icon: '\u{1F4C4}' },
  ],
  'tests/unit': [
    { id: 'tests/unit/button.test.ts', name: 'button.test.ts', type: 'file', icon: '\u{1F4C4}' },
    { id: 'tests/unit/select.test.ts', name: 'select.test.ts', type: 'file', icon: '\u{1F4C4}' },
    { id: 'tests/unit/utils.test.ts', name: 'utils.test.ts', type: 'file', icon: '\u{1F4C4}' },
  ],
  'tests/e2e': [
    { id: 'tests/e2e/app.test.ts', name: 'app.test.ts', type: 'file', icon: '\u{1F4C4}' },
    { id: 'tests/e2e/auth.test.ts', name: 'auth.test.ts', type: 'file', icon: '\u{1F4C4}' },
  ],
};

const cascadeConfig: CascadeConfig<FileNode> = {
  getChildren: (node) => {
    if (node.type === 'file') return null;
    return CHILDREN[node.id] ?? null;
  },
  hasChildren: (node) => node.type === 'folder',
};

/** File tree explorer — teal/cyan palette, cascade sub-menus */
export function SelectSubMenuDemo() {
  const select = useVirtualSelect<FileNode>({
    options: ROOT_ITEMS,
    getOptionValue: (n) => n.id,
    getOptionLabel: (n) => n.name,
    cascade: cascadeConfig,
    placeholder: 'Browse project files...',
    closeOnSelect: true,
  });

  const selectedFile = select.selectedOptions[0];

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
            background: '#f0fdfa',
            border: '1px solid #99f6e4',
            borderRadius: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 14,
            fontFamily: "'SF Mono', 'Fira Code', monospace",
            color: selectedFile ? '#134e4a' : '#5eead4',
            outline: 'none',
            transition: 'border-color 0.15s',
            ...(select.isOpen ? { borderColor: '#14b8a6' } : {}),
          }}
        >
          <span>
            {selectedFile ? `${selectedFile.icon} ${selectedFile.name}` : 'Browse project files...'}
          </span>
          <span style={{ color: '#5eead4', fontSize: 12 }}>{select.isOpen ? '▲' : '▼'}</span>
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
              background: '#f0fdfa',
              border: '1px solid #99f6e4',
              borderRadius: 8,
              boxShadow: '0 8px 30px rgba(20,184,166,0.15)',
              zIndex: 50,
              overflow: 'visible',
            }}
          >
            {/* Main options */}
            <div
              ref={select.menuRef}
              onKeyDown={select.handleMenuKeyDown}
              style={{ maxHeight: 320, overflow: 'auto', position: 'relative' }}
            >
              <div style={{ height: select.totalSize, position: 'relative' }}>
                {select.virtualItems.map((vi) => {
                  const item = select.flattenedItems[vi.index];
                  if (item.type !== 'option' || !item.option) return null;
                  const node = item.option;
                  const isSelected = select.selectedValues.includes(node.id);
                  const isFocused = vi.index === select.focusedIndex;
                  const isFolder = node.type === 'folder';

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
                        onClick={() => {
                          if (isFolder) {
                            select.openSubMenu(node);
                          } else {
                            select.selectValue(node.id);
                          }
                        }}
                        onMouseEnter={() => select.setFocusedIndex(vi.index)}
                        style={{
                          padding: '9px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          cursor: 'pointer',
                          background: isFocused
                            ? '#ccfbf1'
                            : isSelected
                              ? '#d1fae5'
                              : 'transparent',
                          transition: 'background 0.1s',
                          fontFamily: "'SF Mono', 'Fira Code', monospace",
                        }}
                      >
                        <span style={{ fontSize: 16 }}>{node.icon}</span>
                        <span
                          style={{
                            flex: 1,
                            fontSize: 13,
                            color: '#134e4a',
                            fontWeight: isFolder ? 600 : 400,
                          }}
                        >
                          {node.name}
                        </span>
                        {isFolder && <span style={{ color: '#5eead4', fontSize: 12 }}>▸</span>}
                        {isSelected && <span style={{ color: '#14b8a6', fontSize: 14 }}>✓</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sub-menus */}
            {select.subMenus.map((subMenu, depth) => (
              <div
                key={subMenu.parentValue}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: `calc(100% + ${4 + depth * 244}px)`,
                  minWidth: 240,
                  background: '#f0fdfa',
                  border: '1px solid #99f6e4',
                  borderRadius: 8,
                  boxShadow: '0 8px 30px rgba(20,184,166,0.15)',
                  overflow: 'hidden',
                }}
              >
                {/* Sub-menu header */}
                <div
                  style={{
                    padding: '6px 12px',
                    borderBottom: '1px solid #99f6e4',
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#14b8a6',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontFamily: "'SF Mono', 'Fira Code', monospace",
                  }}
                >
                  {subMenu.parentValue.split('/').pop()}
                </div>

                {subMenu.isLoading ? (
                  <div
                    style={{ padding: '16px', textAlign: 'center', color: '#5eead4', fontSize: 13 }}
                  >
                    Loading...
                  </div>
                ) : (
                  subMenu.options.map((child, i) => {
                    const isChildFolder = child.type === 'folder';
                    const isChildSelected = select.selectedValues.includes(child.id);

                    return (
                      <div
                        key={child.id}
                        onClick={() => {
                          if (isChildFolder) {
                            select.openSubMenu(child);
                          } else {
                            select.selectValue(child.id);
                          }
                        }}
                        style={{
                          padding: '8px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          cursor: 'pointer',
                          background: i === subMenu.focusedIndex ? '#ccfbf1' : 'transparent',
                          transition: 'background 0.1s',
                          fontFamily: "'SF Mono', 'Fira Code', monospace",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#ccfbf1')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <span style={{ fontSize: 14 }}>{child.icon}</span>
                        <span
                          style={{
                            flex: 1,
                            fontSize: 13,
                            color: '#134e4a',
                            fontWeight: isChildFolder ? 600 : 400,
                          }}
                        >
                          {child.name}
                        </span>
                        {isChildFolder && <span style={{ color: '#5eead4', fontSize: 12 }}>▸</span>}
                        {isChildSelected && (
                          <span style={{ color: '#14b8a6', fontSize: 14 }}>✓</span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <p style={{ fontSize: 12, color: '#5eead4', marginTop: 10 }}>
        Click folders to expand sub-menus · Arrow keys to navigate
      </p>
    </div>
  );
}
