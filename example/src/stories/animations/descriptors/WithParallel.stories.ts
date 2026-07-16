import type { Meta, StoryObj } from '@storybook/react';
import Example from './WithParallel';

const meta = {
  title: 'Animations/Descriptors/withParallel',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
