import type { Meta, StoryObj } from '@storybook/react';
import Example from './WithDelay';

const meta = {
  title: 'Animations/Descriptors/withDelay',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

