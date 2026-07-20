import type { Meta, StoryObj } from '@storybook/react';
import Example from './PlainChild';

const meta = {
  title: 'Animations/Modules/Presence/PlainChild',
  component: Example,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
