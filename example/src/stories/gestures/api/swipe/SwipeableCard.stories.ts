import type { Meta, StoryObj } from '@storybook/react';

import Example from './SwipeableCard';

const meta = {
  title: 'Gestures/API/Swipe/Swipeable Card',
  component: Example,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SwipeableCard: Story = {};
