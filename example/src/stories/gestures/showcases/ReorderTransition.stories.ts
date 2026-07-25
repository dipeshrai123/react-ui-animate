import type { Meta, StoryObj } from '@storybook/react';
import Example from './ReorderTransition';

const meta = {
  title: 'Gestures/Showcases/Reorder/Custom Transition',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
