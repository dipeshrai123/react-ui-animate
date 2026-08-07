import type { Meta, StoryObj } from '@storybook/react';
import Example from './UseDragBasic';

const meta = {
  title: 'Gestures/Hooks/useDrag/Basic',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
