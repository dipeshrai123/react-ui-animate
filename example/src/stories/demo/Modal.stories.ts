import type { Meta, StoryObj } from '@storybook/react';

import { ModalComp as Example } from './Modal';

const meta = {
  title: 'Demo/Modal',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Modal: Story = {};
