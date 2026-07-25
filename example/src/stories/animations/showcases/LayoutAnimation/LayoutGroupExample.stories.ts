import type { Meta, StoryObj } from '@storybook/react';

import Example from './LayoutGroupExample';

const meta = {
  title: 'Animations/Showcases/Layout Animation/LayoutGroup',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
