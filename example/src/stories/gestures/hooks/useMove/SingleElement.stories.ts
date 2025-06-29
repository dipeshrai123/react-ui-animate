import type { Meta, StoryObj } from '@storybook/react';

import Example from './SingleElement';

const meta = {
  title: 'Gestures/Hooks/useMove',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleElement: Story = {};
