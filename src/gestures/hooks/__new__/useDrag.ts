import { DragEventType } from '../../types';

type ConfigCallback = (event: DragEventType, context: unknown) => void;

interface UseDragConfig {
  onStart?: ConfigCallback;
  onActive?: ConfigCallback;
  onEnd?: ConfigCallback;
}

export const useDrag = (config: UseDragConfig) => {
  console.log(config);
};
