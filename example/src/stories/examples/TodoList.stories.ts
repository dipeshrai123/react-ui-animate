import type { Meta, StoryObj } from '@storybook/react';

import Example from './TodoList';

const meta = {
  title: 'Examples/TodoList',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TodoList: Story = {};
