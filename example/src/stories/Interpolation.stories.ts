import type { Meta, StoryObj } from '@storybook/react';

import { Interpolation as Example } from './Interpolation';

const meta = {
  title: 'Examples/Interpolation',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interpolation: Story = {};
