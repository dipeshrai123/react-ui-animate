import { RefObject, useEffect } from 'react';

import {
  type DragConfig,
  type DragEvent,
  DragGesture,
} from '../controllers/DragGesture';
import { type MoveEvent, MoveGesture } from '../controllers//MoveGesture';
import { type ScrollEvent, ScrollGesture } from '../controllers/ScrollGesture';
import { type WheelEvent, WheelGesture } from '../controllers/WheelGesture';

type HandlerMap = Partial<{
  drag: { callback: (e: DragEvent) => void; config?: DragConfig };
  move: { callback: (e: MoveEvent) => void };
  scroll: { callback: (e: ScrollEvent) => void };
  wheel: { callback: (e: WheelEvent) => void };
}>;

export function useGesture<T extends HTMLElement>(
  ref: RefObject<T>,
  handlers: HandlerMap = {}
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
