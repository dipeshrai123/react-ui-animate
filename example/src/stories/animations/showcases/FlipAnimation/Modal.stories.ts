import type { Meta, StoryObj } from '@storybook/react';

import Example from './Modal';

const meta = {
  title: 'Animations/Showcases/Flip Animation/Modal',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
