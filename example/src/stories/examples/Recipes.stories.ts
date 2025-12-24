import type { Meta, StoryObj } from '@storybook/react';

import Example from './Recipes';

const meta = {
  title: 'Examples/Recipes',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AnimationRecipes: Story = {};

