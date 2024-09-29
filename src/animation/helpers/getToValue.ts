import { withEase, withString } from '../controllers';
import { ToValue } from '../types';

export function getToValue(val: string | number | ToValue): ToValue {
  if (typeof val === 'number') {
    return withEase(val);
  } else if (typeof val === 'string') {
    return withString(val);
  } else {
    return val;
  }
}
