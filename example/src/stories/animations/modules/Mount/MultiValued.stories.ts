import type { Meta, StoryObj } from '@storybook/react';

import Example from './MultiValued';

const meta = {
  title: 'Animations/Modules/Mount',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MultiValued: Story = {};
