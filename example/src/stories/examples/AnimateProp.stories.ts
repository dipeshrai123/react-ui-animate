import type { Meta, StoryObj } from '@storybook/react';

import Example from './AnimateProp';

const meta = {
  title: 'Examples/AnimateProp',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DeclarativeAnimate: Story = {};

