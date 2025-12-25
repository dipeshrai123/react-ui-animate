import type { Meta, StoryObj } from '@storybook/react';

import Example from './ScaleOnWheel';

const meta = {
  title: 'Gestures/Hooks/useWheel/Scale on Wheel',
  component: Example,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ScaleOnWheel: Story = {};

