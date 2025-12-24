import type { Meta, StoryObj } from '@storybook/react';

import Example from './MagneticButton';

const meta = {
  title: 'Gestures/Hooks/useMove/Magnetic Button',
  component: Example,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MagneticButton: Story = {};

