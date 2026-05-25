import type { Meta, StoryObj } from '@storybook/react';
import Example from './StateAnimations';

const meta = {
  title: 'Animations/State Animations',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
