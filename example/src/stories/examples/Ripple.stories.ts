import type { Meta, StoryObj } from '@storybook/react';

import { RippleButton as Example } from './Ripple';

const meta = {
  title: 'Examples/RippleButton',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RippleButton: Story = {};
