import type { Meta, StoryObj } from '@storybook/react';

import Example from './FollowChain';

const meta = {
  title: 'Examples/Follow Chain',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
