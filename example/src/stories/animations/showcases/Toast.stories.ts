import type { Meta, StoryObj } from '@storybook/react';

import Example from './Toast';

const meta = {
  title: 'Animations/Showcases/Toast',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
