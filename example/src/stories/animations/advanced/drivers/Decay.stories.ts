import type { Meta, StoryObj } from '@storybook/react';
import Example from './Decay';

const meta = {
  title: 'Animations/Advanced/Drivers/decay',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

