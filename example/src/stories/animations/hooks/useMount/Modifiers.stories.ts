import type { Meta, StoryObj } from '@storybook/react';

import Example from './Modifiers';

const meta = {
  title: 'Animations/Hooks/useMount',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Modifiers: Story = {};
