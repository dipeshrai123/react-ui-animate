import type { Meta, StoryObj } from '@storybook/react';

import Example from './SkeletonReveal';

const meta = {
  title: 'Examples/Skeleton Reveal',
  component: Example,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
