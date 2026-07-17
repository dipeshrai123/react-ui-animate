import type { Meta, StoryObj } from '@storybook/react';
import Example from './AnimateTo';

const meta = {
  title: 'Animations/Utilities/animateTo',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
