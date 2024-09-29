import { withNative } from '../controllers';
import { ToValue } from '../types';

export function getToValue(val: string | number | ToValue): ToValue {
  if (typeof val === 'number' || typeof val === 'string') {
    return withNative(val);
  } else {
    return val;
  }
}
