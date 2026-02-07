import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { VirtualList } from './VirtualList';

interface TestItem {
  id: string;
  text: string;
}

const testData: TestItem[] = [
  { id: 'a', text: 'Item A' },
  { id: 'b', text: 'Item B' },
  { id: 'c', text: 'Item C' },
];

const getItemId = (item: TestItem) => item.id;

describe('VirtualList component', () => {
  it('renders container with role="list"', () => {
    const { container } = render(
      <VirtualList
        data={testData}
        getItemId={getItemId}
        renderItem={({ item }) => <div>{item.text}</div>}
        height={400}
      />
    );

    const list = container.querySelector('[role="list"]');
    expect(list).not.toBeNull();
  });

  it('renders empty state with no listitem elements', () => {
    const { container } = render(
      <VirtualList
        data={[]}
        getItemId={getItemId}
        renderItem={({ item }) => <div>{item.text}</div>}
        height={400}
      />
    );

    const list = container.querySelector('[role="list"]');
    expect(list).not.toBeNull();
    const listItems = container.querySelectorAll('[role="listitem"]');
    expect(listItems.length).toBe(0);
  });

  it('renders ariaLabel on the container', () => {
    const { container } = render(
      <VirtualList
        data={testData}
        getItemId={getItemId}
        renderItem={({ item }) => <div>{item.text}</div>}
        height={400}
        ariaLabel="Test list"
      />
    );

    const list = container.querySelector('[role="list"]');
    expect(list?.getAttribute('aria-label')).toBe('Test list');
  });

  it('applies className and style', () => {
    const { container } = render(
      <VirtualList
        data={testData}
        getItemId={getItemId}
        renderItem={({ item }) => <div>{item.text}</div>}
        height={400}
        className="test-class"
        style={{ border: '1px solid red' }}
      />
    );

    const list = container.querySelector('[role="list"]');
    expect(list?.className).toContain('test-class');
  });

  it('sets tabIndex when keyboard navigation enabled', () => {
    const { container } = render(
      <VirtualList
        data={testData}
        getItemId={getItemId}
        renderItem={({ item }) => <div>{item.text}</div>}
        height={400}
        enableKeyboardNavigation
      />
    );

    const list = container.querySelector('[role="list"]');
    expect(list?.getAttribute('tabindex')).toBe('0');
  });

  it('does not set tabIndex when keyboard navigation disabled', () => {
    const { container } = render(
      <VirtualList
        data={testData}
        getItemId={getItemId}
        renderItem={({ item }) => <div>{item.text}</div>}
        height={400}
      />
    );

    const list = container.querySelector('[role="list"]');
    expect(list?.getAttribute('tabindex')).toBeNull();
  });
});
