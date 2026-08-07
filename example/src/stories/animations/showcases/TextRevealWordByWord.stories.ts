import type { Meta, StoryObj } from '@storybook/react';

import Example from './TextRevealWordByWord';

const meta = {
  title: 'Animations/Showcases/Text Reveal Word By Word',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
