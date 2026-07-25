import type { Meta, StoryObj } from '@storybook/react';

import Example from './Scoreboard';

const meta = {
  title: 'Animations/Showcases/Scoreboard',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
