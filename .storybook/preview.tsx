import React from 'react';
import type { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div
        style={{
          padding: '1rem',
          height: 'calc(100vh - 2rem)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export default preview;
