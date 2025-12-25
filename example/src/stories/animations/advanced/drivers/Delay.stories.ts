import type { Meta, StoryObj } from '@storybook/react';
import Example from './Delay';

const meta = {
  title: 'Animations/Advanced/Drivers/delay',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

