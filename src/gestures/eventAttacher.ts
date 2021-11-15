type MouseEventType =
  | "click"
  | "dblclick"
  | "mousedown"
  | "mousemove"
  | "mouseup"
  | "touchstart"
  | "touchmove"
  | "touchend"
  | "mouseenter"
  | "mouseleave"
  | "mouseout"
  | "mouseover"
  | "scroll"
  | "wheel"
  | "contextmenu";

type DomTargetTypes = Array<Window | Document | HTMLElement>;

/**
 * Attach single document / window event / HTMLElement
 */
function attachEvent(
  domTargets: DomTargetTypes,
  event: MouseEventType,
  callback: (e: any) => void,
  capture: any = false
) {
  domTargets.forEach((target) => {
    target.addEventListener(event, callback, capture);
  });

  return function () {
    domTargets.forEach((target) => {
      target.removeEventListener(event, callback, capture);
    });
  };
}

/**
 * Attach multiple document / window event / HTMLElement
 */
export function attachEvents(
  domTargets: DomTargetTypes,
  events: Array<
    [event: MouseEventType, callback: (e: any) => void, capture?: any]
  >
) {
  const subscribers = new Map();

  events.forEach(function ([event, callback, capture = false]) {
    subscribers.set(event, attachEvent(domTargets, event, callback, capture));
  });

  return function (eventKeys?: Array<string>) {
    for (const [eventKey, subscriber] of subscribers.entries()) {
      if (!eventKeys) {
        subscriber();
        return;
      }

      if (eventKeys.indexOf(eventKey) !== -1) {
        subscriber();
      }
    }
  };
}
