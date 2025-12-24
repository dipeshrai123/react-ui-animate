import type { Meta, StoryObj } from '@storybook/react';
import Example from './Animate';

const meta = {
  title: 'Animations/Components/animate',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

