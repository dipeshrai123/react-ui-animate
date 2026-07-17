import type { Meta, StoryObj } from '@storybook/react';

import Example from './GestureRotateBasic';

const meta = {
  title: 'Gestures/Rotate/Basic',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
