import { useEffect, useRef, type RefObject } from 'react';
import { getOrCreateTracker } from '../engine/registry';
import type { BaseGestureConfig, GestureDescriptor } from '../api/Gesture';

interface ActiveRegistration {
  updateConfig(config: BaseGestureConfig): void;
  updateHandlers(handlers: any): void;
  unregister(): void;
}

// Every gesture type (Pan/Move/Wheel/Scroll) is registered against the
// shared per-element/window `ElementGestureTracker` the same way — there is
// no per-type special-casing here, which is what makes gestures composable:
// two `useGesture` calls on the same node always end up on one tracker.
function registerGesture(
  target: HTMLElement | Window,
  descriptor: GestureDescriptor<any, any>
): ActiveRegistration {
  const tracker = getOrCreateTracker(target);
  const id = tracker.register(descriptor);
  return {
    updateConfig: (config) => tracker.updateConfig(id, config),
    updateHandlers: (handlers) => tracker.updateHandlers(id, handlers),
    unregister: () => tracker.unregister(id),
  };
}

// Generic over the handlers shape so gesture kinds with a non-standard
// handlers object (e.g. Swipe's `{ onSwipe }`) still get `index` merged in
// array mode, not just the start/change/update/end/finalize stream.
function withIndex(handlers: Record<string, unknown>, index: number): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key in handlers) {
    const fn = handlers[key];
    result[key] = typeof fn === 'function' ? (e: any) => (fn as any)({ ...e, index }) : fn;
  }
  return result;
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
  gesture: GestureDescriptor<any, any>
): void;
export function useGesture(target: Window, gesture: GestureDescriptor<any, any>): void;
export function useGesture<T extends HTMLElement>(
  refs: RefObject<T>[],
  gesture: GestureDescriptor<any, any> | ((index: number) => GestureDescriptor<any, any>)
): void;
export function useGesture(
  target: RefObject<HTMLElement> | RefObject<HTMLElement>[] | Window,
  gesture: GestureDescriptor<any, any> | ((index: number) => GestureDescriptor<any, any>)
): void {
  const singleRegistrationRef = useRef<ActiveRegistration | null>(null);
  const arrayRegistrationsRef = useRef<Map<RefObject<HTMLElement>, ActiveRegistration>>(new Map());

  const resolveDescriptor = (): GestureDescriptor<any, any> => gesture as GestureDescriptor<any, any>;
  const resolveIndexedDescriptor = (index: number): GestureDescriptor<any, any> => {
    const base = typeof gesture === 'function' ? gesture(index) : gesture;
    return { ...base, handlers: withIndex(base.handlers as Record<string, unknown>, index) };
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
