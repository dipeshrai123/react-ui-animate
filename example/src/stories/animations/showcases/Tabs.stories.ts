import type { Meta, StoryObj } from '@storybook/react';

import Example from './Tabs';

const meta = {
  title: 'Animations/Showcases/Tabs',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
