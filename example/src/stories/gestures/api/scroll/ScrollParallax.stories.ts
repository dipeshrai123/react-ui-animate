import type { Meta, StoryObj } from '@storybook/react';

import Example from './ScrollParallax';

const meta = {
  title: 'Gestures/Scroll/Scroll Parallax',
  component: Example,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ScrollParallax: Story = {};

