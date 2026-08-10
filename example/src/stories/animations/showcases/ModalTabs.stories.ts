import type { Meta, StoryObj } from '@storybook/react';

import Example from './ModalTabs';

const meta = {
  title: 'Animations/Showcases/Modal With Tabs',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
