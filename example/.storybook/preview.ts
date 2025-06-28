import type { Preview } from '@storybook/react';

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
};

export default preview;
