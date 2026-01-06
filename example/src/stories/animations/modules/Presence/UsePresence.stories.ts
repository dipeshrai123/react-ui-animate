import type { Meta, StoryObj } from '@storybook/react';
import Example from './UsePresence';

const meta = {
  title: 'Animations/Modules/Presence/UsePresence',
  component: Example,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

