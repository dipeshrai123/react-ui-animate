import type { Meta, StoryObj } from '@storybook/react';
import Example from './WithLoop';

const meta = {
  title: 'Animations/Descriptors/withLoop',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

