import type { Meta, StoryObj } from '@storybook/react';

import { ArrayValues as Example } from './ArrayValues';

const meta = {
  title: 'Examples/Array Values',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ArrayValues: Story = {};
