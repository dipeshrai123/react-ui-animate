import type { Meta, StoryObj } from '@storybook/react';
import Example from './UseIsUnmounting';

const meta = {
  title: 'Animations/Modules/Unmount/UseIsUnmounting',
  component: Example,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

