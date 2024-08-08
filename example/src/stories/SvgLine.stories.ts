import type { Meta, StoryObj } from '@storybook/react';

import { SVGLine as Example } from './SvgLine';

const meta = {
  title: 'Examples/SVGLine',
  component: Example,
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SVGLine: Story = {};
