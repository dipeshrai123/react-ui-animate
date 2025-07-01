import type { Meta, StoryObj } from '@storybook/react';

import Example from './BasicSetup';

const meta = {
  title: 'Animations/Hooks/useMount',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicSetup: Story = {};
