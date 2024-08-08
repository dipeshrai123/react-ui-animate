import type { Meta, StoryObj } from '@storybook/react';

import { Gestures as Example } from './Gestures';

const meta = {
  title: 'Examples/Gestures',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Gestures: Story = {};
