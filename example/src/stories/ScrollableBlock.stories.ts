import type { Meta, StoryObj } from '@storybook/react';

import { SCBlock as Example } from './ScrollableBlock';

const meta = {
  title: 'Examples/ScrollableBlock',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ScrollableBlock: Story = {};
