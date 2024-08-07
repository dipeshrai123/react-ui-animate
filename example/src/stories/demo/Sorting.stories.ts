import type { Meta, StoryObj } from '@storybook/react';

import { Sorting as Example } from './Sorting';

const meta = {
  title: 'Demo/Sorting',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sorting: Story = {};
