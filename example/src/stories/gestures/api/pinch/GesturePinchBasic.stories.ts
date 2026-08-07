import type { Meta, StoryObj } from '@storybook/react';

import Example from './GesturePinchBasic';

const meta = {
  title: 'Gestures/API/Pinch/Basic',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
