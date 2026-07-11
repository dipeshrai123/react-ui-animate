import type { Meta, StoryObj } from '@storybook/react';

import Example from './ThemeSwitch';

const meta = {
  title: 'Examples/Theme Switch',
  component: Example,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
