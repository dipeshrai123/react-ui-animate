import type { Meta, StoryObj } from '@storybook/react';
import Example from './WithKeyframes';

const meta = {
  title: 'Animations/Descriptors/withKeyframes',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
