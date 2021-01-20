/** 
 * Attach single document / window event
*/
export function attachEvent(
  domTarget: Window | Document, 
  event: string, 
  callback: (e: any) => void, 
  capture: boolean = true ) 
{
  domTarget.addEventListener(event, callback, capture);

  return function() {
    domTarget.removeEventListener(event, callback, capture);
  }
}

/** 
 * Attach multiple document / window event
*/
export function attachEvents(
  domTarget: Window | Document,
  events: Array<[event: string, callback: (e: any) => void, capture: boolean]>
) {
  const subscribers: Array<() => void> = [];

  events.forEach(function([event, callback, capture = true]) {
    subscribers.push(attachEvent(domTarget, event, callback, capture));
  });

  return function() {
    subscribers.forEach(function(subscriber) {
      subscriber();
    });
  }
}