import type { Meta, StoryObj } from '@storybook/react';

import { UseAnimatedList as Example } from './useAnimatedList';

const meta = {
  title: 'Core/useAnimatedList',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseAnimatedList: Story = {};
