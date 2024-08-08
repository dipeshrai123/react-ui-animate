import type { Meta, StoryObj } from '@storybook/react';

import { SharedElement as Example } from './SharedElement';

const meta = {
  title: 'Demo/SharedElement',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SharedElement: Story = {};
