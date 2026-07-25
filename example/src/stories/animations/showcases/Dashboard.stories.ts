import type { Meta, StoryObj } from '@storybook/react';
import Dashboard from './Dashboard';

const meta: Meta<typeof Dashboard> = {
  title: 'Examples/Dashboard',
  component: Dashboard,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

