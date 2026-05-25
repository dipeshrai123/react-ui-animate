import type { Preview } from '@storybook/react';
import React from 'react';

import '../src/index.css';

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        method: 'alphabetical',
        order: [
          'Animations',
          ['Hooks', ['useValue', 'useMount']],
          'Gestures',
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
