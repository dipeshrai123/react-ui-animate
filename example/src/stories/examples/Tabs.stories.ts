import type { Meta, StoryObj } from '@storybook/react';

import Example from './Tabs';

const meta = {
  title: 'Examples/Tabs',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
