import { ElementGestureTracker } from './ElementGestureTracker';

// Shared per-element/window lookup — multiple `useGesture` calls targeting
// the same node get the same tracker (and therefore one shared set of native
// listeners), which is what makes composing gestures on one element "free".
const trackers = new WeakMap<HTMLElement | Window, ElementGestureTracker>();

export function getOrCreateTracker(target: HTMLElement | Window): ElementGestureTracker {
  let tracker = trackers.get(target);
  if (!tracker) {
    tracker = new ElementGestureTracker(target);
    trackers.set(target, tracker);
  }
  return tracker;
}
