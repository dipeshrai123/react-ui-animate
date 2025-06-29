import type { Meta, StoryObj } from '@storybook/react';

import Example from './String';

const meta = {
  title: 'Animations/Hooks/useValue',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const String: Story = {};
