import type { Meta, StoryObj } from '@storybook/react';

import Example from './DraggableCard';

const meta = {
  title: 'Gestures/Hooks/useDrag/Draggable Card',
  component: Example,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DraggableCard: Story = {};

