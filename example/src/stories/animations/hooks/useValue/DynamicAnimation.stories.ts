import type { Meta, StoryObj } from '@storybook/react';

import { DynamicAnimation as Example } from './DynamicAnimation';

const meta = {
  title: 'Core/useValue',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DynamicAnimation: Story = {};
