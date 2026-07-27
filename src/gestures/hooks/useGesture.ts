import { useEffect, useRef, type RefObject } from 'react';
import { getOrCreateTracker } from '../engine/registry';
import type { BaseGestureConfig, GestureDescriptor } from '../api/Gesture';

interface ActiveRegistration {
  updateConfig(config: BaseGestureConfig): void;
  updateHandlers(handlers: any): void;
  unregister(): void;
}

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

function withIndex(handlers: Record<string, unknown>, index: number): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key in handlers) {
    const fn = handlers[key];
    result[key] = typeof fn === 'function' ? (e: any) => (fn as any)({ ...e, index }) : fn;
  }
  return result;
}

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
  const singleRegisteredElRef = useRef<HTMLElement | Window | null>(null);
  const arrayRegistrationsRef = useRef<Map<RefObject<HTMLElement>, ActiveRegistration>>(new Map());

  const resolveDescriptor = (): GestureDescriptor<any, any> => gesture as GestureDescriptor<any, any>;
  const resolveIndexedDescriptor = (index: number): GestureDescriptor<any, any> => {
    const base = typeof gesture === 'function' ? gesture(index) : gesture;
    return { ...base, handlers: withIndex(base.handlers as Record<string, unknown>, index) };
  };

  useEffect(() => {
    if (Array.isArray(target)) return;

    const el: HTMLElement | Window | null =
      target instanceof Window ? target : target.current;

    if (el === singleRegisteredElRef.current) return;

    singleRegistrationRef.current?.unregister();
    singleRegistrationRef.current = null;
    singleRegisteredElRef.current = el;

    if (el) {
      singleRegistrationRef.current = registerGesture(el, resolveDescriptor());
    }
  });

  useEffect(() => {
    if (Array.isArray(target)) return;
    return () => {
      singleRegistrationRef.current?.unregister();
      singleRegistrationRef.current = null;
      singleRegisteredElRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (Array.isArray(target)) return;
    const reg = singleRegistrationRef.current;
    if (!reg) return;
    const d = resolveDescriptor();
    reg.updateConfig(d.config);
    reg.updateHandlers(d.handlers);
  });

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
