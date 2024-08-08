import type { Meta, StoryObj } from '@storybook/react';

import { Scroll as Example } from './Scroll';

const meta = {
  title: 'Examples/Scroll',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Scroll: Story = {};
