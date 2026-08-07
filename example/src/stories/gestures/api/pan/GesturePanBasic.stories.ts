import type { Meta, StoryObj } from '@storybook/react';

import Example from './GesturePanBasic';

const meta = {
  title: 'Gestures/API/Pan/Basic',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
