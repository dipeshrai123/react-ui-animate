import type { Meta, StoryObj } from '@storybook/react';
import Example from './ReorderPlaylist';

const meta = {
  title: 'Gestures/Showcases/Reorder/Playlist',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
