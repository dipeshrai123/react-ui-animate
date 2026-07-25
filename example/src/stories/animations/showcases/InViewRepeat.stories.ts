import type { Meta, StoryObj } from '@storybook/react';

import Example from './InViewRepeat';

const meta = {
  title: 'Examples/InView Repeat',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
