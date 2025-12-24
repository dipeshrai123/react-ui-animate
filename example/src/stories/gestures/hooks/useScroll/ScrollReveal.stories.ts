import type { Meta, StoryObj } from '@storybook/react';

import Example from './ScrollReveal';

const meta = {
  title: 'Gestures/Hooks/useScroll/Scroll Reveal',
  component: Example,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ScrollReveal: Story = {};

