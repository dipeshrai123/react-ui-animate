import type { Meta, StoryObj } from '@storybook/react';

import { SnapTo as Example } from './SnapTo';

const meta = {
  title: 'Examples/SnapTo',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SnapTo: Story = {};
