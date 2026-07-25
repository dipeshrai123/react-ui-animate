import type { Meta, StoryObj } from '@storybook/react';

import Example from './SharedElement';

const meta = {
  title: 'Gestures/Showcases/SharedElement',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
