import type { Meta, StoryObj } from '@storybook/react';
import Example from './Sequence';

const meta = {
  title: 'Animations/Drivers/sequence',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

