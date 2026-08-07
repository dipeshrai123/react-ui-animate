import type { Preview } from '@storybook/react';
import React from 'react';

import '../src/index.css';

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'studio',
      values: [
        { name: 'studio', value: '#0a0a0d' },
        { name: 'light', value: '#f4f4f6' },
      ],
    },
    options: {
      storySort: {
        method: 'alphabetical',
        order: [
          'Animations',
          [
            'Overview',
            'Components',
            'Hooks',
            'Descriptors',
            'Utilities',
            'Modules',
            'State Animations',
            'Recipes',
            'Showcases',
          ],
          'Gestures',
          ['API', 'Hooks', 'Showcases'],
          '*',
        ],
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  globalTypes: {
    strictMode: {
      description: 'Enable React Strict Mode',
      defaultValue: false,
      toolbar: {
        title: 'Strict Mode',
        icon: 'lock',
        items: [
          { value: false, title: 'Disabled' },
          { value: true, title: 'Enabled' },
        ],
        showName: true,
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const strictMode = context.globals.strictMode === true;

      if (strictMode) {
        return React.createElement(
          React.StrictMode,
          null,
          React.createElement(Story)
        );
      }

      return React.createElement(Story);
    },
  ],
};

export default preview;
