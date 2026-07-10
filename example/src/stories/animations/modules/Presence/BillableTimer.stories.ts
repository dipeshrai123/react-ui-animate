import type { Meta, StoryObj } from '@storybook/react';
import Example from './BillableTimer';

const meta = {
  title: 'Animations/Modules/Presence/BillableTimer',
  component: Example,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    animationType: {
      control: { type: 'radio' },
      options: ['spring', 'timing'],
      description: 'Switch between withSpring and withTiming for enter/exit animations',
    },
    bgColor: {
      control: { type: 'color' },
      description: 'Card background colour',
    },
  },
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    animationType: "timing",
  },
};

export const SecondTimer: Story = {
  args: {
    bgColor: '#f0f9ff',
    animationType: "timing",
  },
};
