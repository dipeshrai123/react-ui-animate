import type { Meta, StoryObj } from '@storybook/react';

import { UseValues as Example } from './useValue';

const meta = {
  title: 'Core/useValues',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseValues: Story = {};
