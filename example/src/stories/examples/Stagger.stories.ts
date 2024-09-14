import type { Meta, StoryObj } from '@storybook/react';

import Example from './Stagger';

const meta = {
  title: 'Examples/Stagger',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Stagger: Story = {};
