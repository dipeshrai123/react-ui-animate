import type { Meta, StoryObj } from '@storybook/react';

import Example from './Loop';

const meta = {
  title: 'Examples/Loop',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loop: Story = {};
