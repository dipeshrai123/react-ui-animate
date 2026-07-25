import type { Meta, StoryObj } from '@storybook/react';

import Example from './InView';

const meta = {
  title: 'Animations/Showcases/InView',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
