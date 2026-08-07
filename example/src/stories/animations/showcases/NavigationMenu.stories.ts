import type { Meta, StoryObj } from '@storybook/react';
import NavigationMenu from './NavigationMenu';

const meta: Meta<typeof NavigationMenu> = {
  title: 'Animations/Showcases/Navigation Menu',
  component: NavigationMenu,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

