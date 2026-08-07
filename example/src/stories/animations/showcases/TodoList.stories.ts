import type { Meta, StoryObj } from '@storybook/react';

import Example from './TodoList';

const meta = {
  title: 'Animations/Showcases/TodoList',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
