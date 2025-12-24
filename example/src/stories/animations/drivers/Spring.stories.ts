import type { Meta, StoryObj } from '@storybook/react';
import Example from './Spring';

const meta = {
  title: 'Animations/Drivers/spring',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

