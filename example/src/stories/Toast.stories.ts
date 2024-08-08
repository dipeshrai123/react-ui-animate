import type { Meta, StoryObj } from '@storybook/react';

import { ToastComp as Example } from './Toast';

const meta = {
  title: 'Examples/Toast',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Toast: Story = {};
