import type { Meta, StoryObj } from '@storybook/react';
import Example from './WithTiming';

const meta = {
  title: 'Animations/Descriptors/withTiming',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

