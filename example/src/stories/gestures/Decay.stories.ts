import type { Meta, StoryObj } from '@storybook/react';

import { Decay as Example } from './Decay';

const meta = {
  title: 'Gestures/Decay Animation',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DecayAnimation: Story = {};
