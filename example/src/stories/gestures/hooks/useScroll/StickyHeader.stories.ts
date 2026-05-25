import type { Meta, StoryObj } from '@storybook/react';

import Example from './StickyHeader';

const meta = {
  title: 'Gestures/Hooks/useScroll/Sticky Header',
  component: Example,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StickyHeader: Story = {};

