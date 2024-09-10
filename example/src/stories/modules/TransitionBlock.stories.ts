import type { Meta, StoryObj } from '@storybook/react';

import { TBExample as Example } from './TransitionBlock';

const meta = {
  title: 'Modules/TransitionBlock',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TransitionBlock: Story = {};
