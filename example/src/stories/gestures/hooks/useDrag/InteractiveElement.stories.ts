import type { Meta, StoryObj } from '@storybook/react';

import Example from './InteractiveElement';

const meta = {
  title: 'Gestures/Hooks/useDrag',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InteractiveElement: Story = {};
