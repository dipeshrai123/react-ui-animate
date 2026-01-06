import type { Meta, StoryObj } from '@storybook/react';
import Example from './Recipes';

const meta = {
  title: 'Animations/Recipes',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

