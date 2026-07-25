import type { Meta, StoryObj } from '@storybook/react';
import Example from './UseUnmount';

const meta = {
  title: 'Animations/Modules/Unmount/UseUnmount',
  component: Example,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

