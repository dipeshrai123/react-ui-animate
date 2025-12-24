import type { Meta, StoryObj } from '@storybook/react';

import Example from './ZoomOnWheel';

const meta = {
  title: 'Gestures/Hooks/useWheel/Zoom on Wheel',
  component: Example,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ZoomOnWheel: Story = {};

