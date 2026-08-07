import { ElementGestureTracker } from './ElementGestureTracker';

const trackers = new WeakMap<HTMLElement | Window, ElementGestureTracker>();

export function getOrCreateTracker(target: HTMLElement | Window): ElementGestureTracker {
  let tracker = trackers.get(target);
  if (!tracker) {
    tracker = new ElementGestureTracker(target);
    trackers.set(target, tracker);
  }
  return tracker;
}
