import { RefObject, useEffect } from 'react';

import { type DragConfig, DragGesture } from '../controllers/DragGesture';
import { MoveGesture } from '../controllers//MoveGesture';
import { ScrollGesture } from '../controllers/ScrollGesture';
import { WheelGesture } from '../controllers/WheelGesture';

type HandlerMap<T, C = any> = Partial<{
  drag: { callback: (e: T) => void; config?: C };
  move: { callback: (e: T) => void };
  scroll: { callback: (e: T) => void };
  wheel: { callback: (e: T) => void };
}>;

export function useGesture<T extends HTMLElement>(
  ref: RefObject<T>,
  handlers: HandlerMap<any, any> = {}
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const cleanups: Array<() => void> = [];

    if (handlers.drag) {
      const { callback, config } = handlers.drag as {
        callback: (e: any) => void;
        config?: DragConfig;
      };
      const g = new DragGesture(config);
      g.onChange(callback).onEnd(callback);
      cleanups.push(g.attach(el));
    }

    if (handlers.move) {
      const { callback } = handlers.move as { callback: (e: any) => void };
      const g = new MoveGesture();
      g.onChange(callback).onEnd(callback);
      cleanups.push(g.attach(el));
    }

    if (handlers.scroll) {
      const { callback } = handlers.scroll as {
        callback: (e: any) => void;
      };
      const g = new ScrollGesture();
      g.onChange(callback).onEnd(callback);
      cleanups.push(g.attach(el));
    }

    if (handlers.wheel) {
      const { callback } = handlers.wheel as {
        callback: (e: any) => void;
      };
      const g = new WheelGesture();
      g.onChange(callback).onEnd(callback);
      cleanups.push(g.attach(el));
    }

    return () => {
      cleanups.reverse().forEach((fn) => fn());
    };
  }, [
    ref,
    handlers.drag?.callback,
    handlers.drag?.config,
    handlers.move?.callback,
    handlers.scroll?.callback,
    handlers.wheel?.callback,
  ]);
}
