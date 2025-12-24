import type { Meta, StoryObj } from '@storybook/react';

import Example from './ReadingProgress';

const meta = {
  title: 'Gestures/Hooks/useScroll/Reading Progress',
  component: Example,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ReadingProgress: Story = {};

