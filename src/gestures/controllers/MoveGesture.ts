import { Gesture } from './Gesture';
import {
  computeMovement,
  createKinematicState,
  updateKinematics,
  type KinematicState,
} from '../engine/PointerTracker';

export interface MoveEvent {
  movement: { x: number; y: number };
  offset: { x: number; y: number };
  velocity: { x: number; y: number };
  event: PointerEvent;
  cancel?: () => void;
}

export class MoveGesture extends Gesture<MoveEvent> {
  private attachedEls = new Set<HTMLElement | Window>();

  private kinematics: KinematicState = createKinematicState({ x: 0, y: 0, t: 0 });

  private movement = { x: 0, y: 0 };
  private offset = { x: 0, y: 0 };
  private startPos: { x: number; y: number } | null = null;

  attach(elements: HTMLElement | HTMLElement[] | Window): () => void {
    const els = Array.isArray(elements) ? elements : [elements];
    const move = this.onMove.bind(this);
    const leave = this.onLeave.bind(this);

    els.forEach((el) => {
      this.attachedEls.add(el);
      el.addEventListener('pointermove', move, { passive: false });
      el.addEventListener('pointerleave', leave);
    });

    return () => {
      els.forEach((el) => {
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerleave', leave);
        this.attachedEls.delete(el);
      });
    };
  }

  cancel(): void {}

  private onMove(e: PointerEvent) {
    if (this.startPos === null) {
      this.startPos = { x: e.clientX, y: e.clientY };
      this.kinematics = createKinematicState({
        x: e.clientX,
        y: e.clientY,
        t: e.timeStamp,
      });
    }

    this.kinematics = updateKinematics(this.kinematics, {
      x: e.clientX,
      y: e.clientY,
      t: e.timeStamp,
    });

    this.movement = computeMovement(this.startPos, { x: e.clientX, y: e.clientY });

    const tgt = e.currentTarget as HTMLElement | Window;
    const rect =
      tgt instanceof HTMLElement
        ? tgt.getBoundingClientRect()
        : { left: 0, top: 0 };

    this.offset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    this.emitChange({
      movement: { ...this.movement },
      offset: { ...this.offset },
      velocity: { ...this.kinematics.velocity },
      event: e,
      cancel: () => this.onLeave(e),
    });
  }

  private onLeave(e: PointerEvent) {
    this.emitEnd({
      movement: { ...this.movement },
      offset: { ...this.offset },
      velocity: { ...this.kinematics.velocity },
      event: e,
      cancel: () => {},
    });
  }
}
