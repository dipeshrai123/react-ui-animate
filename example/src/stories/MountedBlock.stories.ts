import type { Meta, StoryObj } from '@storybook/react';

import { Mounted as Example } from './MountedBlock';

const meta = {
  title: 'Examples/MountedBlock',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MountedBlock: Story = {};
