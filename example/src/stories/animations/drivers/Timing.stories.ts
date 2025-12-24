import type { Meta, StoryObj } from '@storybook/react';
import Example from './Timing';

const meta = {
  title: 'Animations/Drivers/timing',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

