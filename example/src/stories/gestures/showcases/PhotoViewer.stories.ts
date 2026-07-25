import type { Meta, StoryObj } from '@storybook/react';

import Example from './PhotoViewer';

const meta = {
  title: 'Examples/Photo Viewer (Pan + Pinch + Rotate)',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
