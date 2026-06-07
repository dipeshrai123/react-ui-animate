import type { Meta, StoryObj } from '@storybook/react';

import Example from './ScrollLandingPage';

const meta = {
  title: 'Examples/Scroll Landing Page',
  component: Example,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
