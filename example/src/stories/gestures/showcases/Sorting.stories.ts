import type { Meta, StoryObj } from '@storybook/react';

import Example from './Sorting';

const meta = {
  title: 'Gestures/Showcases/Sorting',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
