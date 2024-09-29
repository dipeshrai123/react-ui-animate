import { spring } from '@raidipesh78/re-motion';

export type Callback = (result: { finished: boolean; value: number }) => void;

export type ControllerAnimation = ReturnType<typeof spring>;
