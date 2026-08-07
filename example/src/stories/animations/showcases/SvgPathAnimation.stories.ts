import type { Meta, StoryObj } from '@storybook/react';

import Example from './SvgPathAnimation';

const meta = {
  title: 'Animations/Showcases/Svg Path Animation',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
