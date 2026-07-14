import type { Meta, StoryObj } from '@storybook/react';

import Example from './HorizontalScroll';

const meta = {
  title: 'Gestures/Wheel/Horizontal Scroll',
  component: Example,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HorizontalScroll: Story = {};

