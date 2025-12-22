import { MotionValue } from './MotionValue';

export function isMotionValue(v: any): v is MotionValue<any> {
  return v instanceof MotionValue;
}
