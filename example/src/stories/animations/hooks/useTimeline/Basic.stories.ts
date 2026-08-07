import type { Meta, StoryObj } from '@storybook/react';
import Example from './Basic';

const meta = {
  title: 'Animations/Hooks/useTimeline/Basic',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
