import type { Meta, StoryObj } from '@storybook/react';

import Example from './Slider';

const meta = {
  title: 'Examples/Slider',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Slider: Story = {};
