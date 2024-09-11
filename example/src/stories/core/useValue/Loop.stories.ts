import type { Meta, StoryObj } from '@storybook/react';

import { Loop as Example } from './Loop';

const meta = {
  title: 'Core/useValue',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loop: Story = {};
