import type { Meta, StoryObj } from '@storybook/react';
import ProductShowcase from './ProductShowcase';

const meta: Meta<typeof ProductShowcase> = {
  title: 'Examples/Product Showcase',
  component: ProductShowcase,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

