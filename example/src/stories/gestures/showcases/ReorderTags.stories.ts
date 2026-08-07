import type { Meta, StoryObj } from '@storybook/react';
import Example from './ReorderTags';

const meta = {
  title: 'Gestures/Showcases/Reorder/Horizontal Tags',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
