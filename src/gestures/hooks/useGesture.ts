import { useEffect, useRef, type RefObject } from 'react';
import { getOrCreateTracker } from '../engine/registry';
import { MoveGesture } from '../controllers/MoveGesture';
import { WheelGesture } from '../controllers/WheelGesture';
import { ScrollGesture } from '../controllers/ScrollGesture';
import type { BaseGestureConfig, GestureDescriptor, GestureHandlers } from '../api/Gesture';

interface ActiveRegistration {
  updateConfig(config: BaseGestureConfig): void;
  updateHandlers(handlers: GestureHandlers<any>): void;
  unregister(): void;
}

function createContinuousController(type: 'move' | 'wheel' | 'scroll') {
  switch (type) {
    case 'move':
      return new MoveGesture();
    case 'wheel':
      return new WheelGesture();
    case 'scroll':
      return new ScrollGesture();
  }
}

// Registers one descriptor against one concrete target. 'pan' goes through
// the shared ElementGestureTracker/GestureRecognizer engine; the continuous
// types (no recognition gate) directly drive their existing controller
// class, with handlers kept live via a closure variable reassigned in
// `updateHandlers` rather than re-subscribing on every change.
function registerGesture(
  target: HTMLElement | Window,
  descriptor: GestureDescriptor<any>
): ActiveRegistration {
  if (descriptor.type === 'pan') {
    const tracker = getOrCreateTracker(target);
    const id = tracker.register(descriptor);
    return {
      updateConfig: (config) => tracker.updateConfig(id, config),
      updateHandlers: (handlers) => tracker.updateHandlers(id, handlers),
      unregister: () => tracker.unregister(id),
    };
  }

  const controller = createContinuousController(descriptor.type);
  let handlers = descriptor.handlers;

  const detach = controller.attach(target);
  controller.onChange((e: any) => handlers.onChange?.(e));
  controller.onEnd((e: any) => handlers.onEnd?.(e));

  return {
    updateConfig: () => {
      // Continuous gestures (move/wheel/scroll) have no live-tunable config today.
    },
    updateHandlers: (next) => {
      handlers = next;
    },
    unregister: () => detach(),
  };
}

function withIndex(handlers: GestureHandlers<any>, index: number): GestureHandlers<any> {
  const wrap = (fn?: (e: any) => void) => (fn ? (e: any) => fn({ ...e, index }) : undefined);
  return {
    onStart: wrap(handlers.onStart),
    onChange: wrap(handlers.onChange),
    onUpdate: wrap(handlers.onUpdate),
    onEnd: wrap(handlers.onEnd),
    onFinalize: wrap(handlers.onFinalize),
  };
}

/**
 * Attaches a `Gesture.Pan()/Move()/Wheel()/Scroll()` descriptor to an
 * element, `window`, or an array of elements (each getting its own
 * registration, with `index` merged into every emitted event).
 *
 * `config` is pushed live into the engine whenever it changes — editing it
 * after mount actually takes effect. `handlers` are always kept live too, at
 * effectively zero cost (a plain field replacement, no DOM re-attachment).
 * Array mode diffs registrations by ref *identity*, not array length, so
 * reordering/adding/removing refs doesn't tear down unrelated registrations.
 */
export function useGesture<T extends HTMLElement>(
  ref: RefObject<T>,
  gesture: GestureDescriptor<any>
): void;
export function useGesture(target: Window, gesture: GestureDescriptor<any>): void;
export function useGesture<T extends HTMLElement>(
  refs: RefObject<T>[],
  gesture: GestureDescriptor<any> | ((index: number) => GestureDescriptor<any>)
): void;
export function useGesture(
  target: RefObject<HTMLElement> | RefObject<HTMLElement>[] | Window,
  gesture: GestureDescriptor<any> | ((index: number) => GestureDescriptor<any>)
): void {
  const singleRegistrationRef = useRef<ActiveRegistration | null>(null);
  const arrayRegistrationsRef = useRef<Map<RefObject<HTMLElement>, ActiveRegistration>>(new Map());

  const resolveDescriptor = (): GestureDescriptor<any> => gesture as GestureDescriptor<any>;
  const resolveIndexedDescriptor = (index: number): GestureDescriptor<any> => {
    const base = typeof gesture === 'function' ? gesture(index) : gesture;
    return { ...base, handlers: withIndex(base.handlers, index) };
  };

  // Register on mount, unregister on unmount — single ref/window mode.
  useEffect(() => {
    if (Array.isArray(target)) return;

    const el: HTMLElement | Window | null =
      target instanceof Window ? target : target.current;
    if (!el) return;

    const reg = registerGesture(el, resolveDescriptor());
    singleRegistrationRef.current = reg;

    return () => {
      reg.unregister();
      singleRegistrationRef.current = null;
    };
    // Mount/unmount only — ref identity isn't expected to change without a remount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep config/handlers live — single ref/window mode.
  useEffect(() => {
    if (Array.isArray(target)) return;
    const reg = singleRegistrationRef.current;
    if (!reg) return;
    const d = resolveDescriptor();
    reg.updateConfig(d.config);
    reg.updateHandlers(d.handlers);
  });

  // Array mode: diff by ref identity every render (registers new refs,
  // syncs config/handlers on existing ones, unregisters removed ones).
  useEffect(() => {
    if (!Array.isArray(target)) return;

    const map = arrayRegistrationsRef.current;
    const seen = new Set<RefObject<HTMLElement>>();

    target.forEach((ref, index) => {
      seen.add(ref);
      const existing = map.get(ref);
      const d = resolveIndexedDescriptor(index);

      if (existing) {
        existing.updateConfig(d.config);
        existing.updateHandlers(d.handlers);
        return;
      }

      if (!ref.current) return;
      map.set(ref, registerGesture(ref.current, d));
    });

    map.forEach((reg, ref) => {
      if (!seen.has(ref)) {
        reg.unregister();
        map.delete(ref);
      }
    });
  });

  // Array mode: full teardown on unmount only.
  useEffect(() => {
    if (!Array.isArray(target)) return;
    const map = arrayRegistrationsRef.current;
    return () => {
      map.forEach((reg) => reg.unregister());
      map.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
