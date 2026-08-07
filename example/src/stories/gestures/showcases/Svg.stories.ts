import type { Meta, StoryObj } from '@storybook/react';

import Example from './Svg';

const meta = {
  title: 'Gestures/Showcases/Svg',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
