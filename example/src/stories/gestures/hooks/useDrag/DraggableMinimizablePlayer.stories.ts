import type { Meta, StoryObj } from '@storybook/react';

import Example from './DraggableMinimizablePlayer';

const meta = {
  title: 'Gestures/Hooks/useDrag/Draggable Minimizable Player',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DraggableMinimizablePlayer: Story = {};
