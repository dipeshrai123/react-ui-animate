import type { Meta, StoryObj } from '@storybook/react';

import { ArrayStrings as Example } from './ArrayStrings';

const meta = {
  title: 'Core/useValues',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ArrayStrings: Story = {};
