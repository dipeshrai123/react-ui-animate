import type { Meta, StoryObj } from '@storybook/react';
import Example from './MultipleItems';

const meta = {
  title: 'Animations/Modules/Presence/MultipleItems',
  component: Example,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

