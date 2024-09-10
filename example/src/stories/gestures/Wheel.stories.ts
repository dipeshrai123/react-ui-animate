import type { Meta, StoryObj } from '@storybook/react';

import { Wheel as Example } from './Wheel';

const meta = {
  title: 'Gestures/Wheel',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Wheel: Story = {};
