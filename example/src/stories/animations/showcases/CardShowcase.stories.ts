import type { Meta, StoryObj } from '@storybook/react';
import CardShowcase from './CardShowcase';

const meta: Meta<typeof CardShowcase> = {
  title: 'Examples/Card Showcase',
  component: CardShowcase,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

