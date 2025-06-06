import type { Meta, StoryObj } from '@storybook/react';

import { UseValue as Example } from './useValueNew';

const meta = {
  title: 'Experimental/useValueNew',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseValueNew: Story = {};
