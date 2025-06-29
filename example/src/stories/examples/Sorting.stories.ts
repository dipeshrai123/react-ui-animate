import type { Meta, StoryObj } from '@storybook/react';

import Example from './Sorting';

const meta = {
  title: 'Examples/Sorting',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sorting: Story = {};
