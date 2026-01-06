import type { Meta, StoryObj } from '@storybook/react';
import Example from './Overview';

const meta = {
  title: 'Animations/Overview',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

