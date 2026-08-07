import type { Meta, StoryObj } from '@storybook/react';

import Example from './SortableList';

const meta = {
  title: 'Gestures/API/Pan/Sortable List',
  component: Example,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SortableList: Story = {};

