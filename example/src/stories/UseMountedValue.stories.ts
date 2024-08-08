import type { Meta, StoryObj } from '@storybook/react';

import { UseMountedValue as Example } from './useMountedValue';

const meta = {
  title: 'Examples/UseMountedValue',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseMountedValue: Story = {};
