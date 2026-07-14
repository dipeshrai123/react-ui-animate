import type { Meta, StoryObj } from '@storybook/react';

import Example from './MagneticCursor';

const meta = {
  title: 'Gestures/Move/Magnetic Cursor',
  component: Example,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MagneticCursor: Story = {};
