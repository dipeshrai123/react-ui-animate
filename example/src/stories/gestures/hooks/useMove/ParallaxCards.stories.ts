import type { Meta, StoryObj } from '@storybook/react';

import Example from './ParallaxCards';

const meta = {
  title: 'Gestures/Hooks/useMove/Parallax Cards',
  component: Example,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ParallaxCards: Story = {};

