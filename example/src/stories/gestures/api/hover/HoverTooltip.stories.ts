import type { Meta, StoryObj } from '@storybook/react';

import Example from './HoverTooltip';

const meta = {
  title: 'Gestures/Hover/Tooltip',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HoverTooltip: Story = {};
