import type { Meta, StoryObj } from '@storybook/react';

import Example from './CursorFollower';

const meta = {
  title: 'Gestures/Move/Cursor Follower',
  component: Example,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CursorFollower: Story = {};

