import type { Meta, StoryObj } from '@storybook/react';
import Example from './UseDragTransition';

const meta = {
  title: 'Gestures/Hooks/useDrag/Custom Transition',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
