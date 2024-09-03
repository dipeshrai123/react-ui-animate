import type { Meta, StoryObj } from '@storybook/react';

import { MouseMove as Example } from './MouseMove';

const meta = {
  title: 'Gestures/MouseMove',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MouseMove: Story = {};
