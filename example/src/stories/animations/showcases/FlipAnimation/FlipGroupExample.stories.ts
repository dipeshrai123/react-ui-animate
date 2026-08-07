import type { Meta, StoryObj } from '@storybook/react';

import Example from './FlipGroupExample';

const meta = {
  title: 'Animations/Showcases/Flip Animation/FlipGroup',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
