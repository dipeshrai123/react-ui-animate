import type { Meta, StoryObj } from '@storybook/react';

import { SequenceTransition as Example } from './SequenceTransition';

const meta = {
  title: 'Examples/SequenceTransition',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SequenceTransition: Story = {};
