import type { Meta, StoryObj } from '@storybook/react';

import { UseAnimatedValue as Example } from './useAnimatedValue';

const meta = {
  title: 'Core/useAnimatedValue()',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};
