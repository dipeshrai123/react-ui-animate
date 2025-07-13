import type { Meta, StoryObj } from '@storybook/react';

import Example from './ScrollTrigger';

const meta = {
  title: 'Gestures/hooks/useScroll',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ScrollTrigger: Story = {};
