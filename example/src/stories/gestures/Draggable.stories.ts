import type { Meta, StoryObj } from '@storybook/react';

import { Draggable as Example } from './Draggable';

const meta = {
  title: 'Gestures/Conditional Binding',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ConditionalBinding: Story = {};
