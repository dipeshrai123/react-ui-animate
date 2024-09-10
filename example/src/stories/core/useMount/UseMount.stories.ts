import type { Meta, StoryObj } from '@storybook/react';

import { UseMount as Example } from './useMount';

const meta = {
  title: 'Core/useMount',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};
