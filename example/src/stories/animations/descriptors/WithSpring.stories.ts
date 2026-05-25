import type { Meta, StoryObj } from '@storybook/react';
import Example from './WithSpring';

const meta = {
  title: 'Animations/Descriptors/withSpring',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

