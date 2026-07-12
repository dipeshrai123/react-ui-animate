import { Gesture } from './Gesture';
import {
  createKinematicState,
  updateKinematics,
  type KinematicState,
} from '../engine/PointerTracker';

export interface WheelEvent {
  movement: { x: number; y: number };
  offset: { x: number; y: number };
  velocity: { x: number; y: number };
  event: globalThis.WheelEvent;
  cancel?: () => void;
}

export class WheelGesture extends Gesture<WheelEvent> {
  private attachedEls = new Set<HTMLElement | Window>();

  private movement = { x: 0, y: 0 };
  private offset = { x: 0, y: 0 };
  private kinematics: KinematicState = createKinematicState({ x: 0, y: 0, t: 0 });

  private endTimeout?: number;

  attach(elements: HTMLElement | HTMLElement[] | Window): () => void {
    const els = Array.isArray(elements) ? elements : [elements];
    const wheel = this.onWheel.bind(this);

    els.forEach((el) => {
      this.attachedEls.add(el);
      el.addEventListener('wheel', wheel, { passive: false });
    });

    return () => {
      els.forEach((el) => {
        el.removeEventListener('wheel', wheel);
        this.attachedEls.delete(el);
      });

      if (this.endTimeout != null) {
        clearTimeout(this.endTimeout);
        this.endTimeout = undefined;
      }
    };
  }

  cancel(): void {}

  private onWheel(e: globalThis.WheelEvent) {
    e.preventDefault();

    const dx = e.deltaX;
    const dy = e.deltaY;

    this.movement = { x: dx, y: dy };
    this.offset = { x: this.offset.x + dx, y: this.offset.y + dy };

    // Fed the running cumulative offset (not the raw per-event delta) so the
    // shared kinematics util derives the same dx/dy internally via its own
    // prev-sample diff; velocity ends up identical to computing it from `dx`/`dy` directly.
    this.kinematics = updateKinematics(this.kinematics, {
      x: this.offset.x,
      y: this.offset.y,
      t: e.timeStamp,
    });

    this.emitChange({
      movement: { ...this.movement },
      offset: { ...this.offset },
      velocity: { ...this.kinematics.velocity },
      event: e,
      cancel: () => {
        if (this.endTimeout != null) clearTimeout(this.endTimeout);
      },
    });

    if (this.endTimeout != null) clearTimeout(this.endTimeout);
    this.endTimeout = window.setTimeout(() => {
      this.emitEnd({
        movement: { ...this.movement },
        offset: { ...this.offset },
        velocity: { ...this.kinematics.velocity },
        event: e,
        cancel: () => {},
      });
    }, 150);
  }
}
