import type { Meta, StoryObj } from '@storybook/react';

import Example from './Grid';

const meta = {
  title: 'Animations/Showcases/Flip Animation/Filter & Shuffle Grid',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
