import type { Meta, StoryObj } from '@storybook/react';

import Example from './SnapPoints';

const meta = {
  title: 'Examples/SnapPoints',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SnapPoints: Story = {};
