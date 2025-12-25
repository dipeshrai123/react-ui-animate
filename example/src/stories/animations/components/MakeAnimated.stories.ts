import type { Meta, StoryObj } from '@storybook/react';
import Example from './MakeAnimated';

const meta = {
  title: 'Animations/Components/makeAnimated',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

