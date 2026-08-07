import type { Meta, StoryObj } from '@storybook/react';

import Example from './Accordion';

const meta = {
  title: 'Animations/Showcases/Flip Animation/Accordion',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
