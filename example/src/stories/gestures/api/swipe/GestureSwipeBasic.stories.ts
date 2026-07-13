import type { Meta, StoryObj } from '@storybook/react';

import Example from './GestureSwipeBasic';

const meta = {
  title: 'Gestures/Swipe/Basic',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
