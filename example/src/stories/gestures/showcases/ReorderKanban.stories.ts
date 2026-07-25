import type { Meta, StoryObj } from '@storybook/react';
import Example from './ReorderKanban';

const meta = {
  title: 'Gestures/Showcases/Reorder/Kanban (Cross-List)',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
