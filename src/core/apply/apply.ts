import { applyStyleProps } from './applyStyleProp';
import { isMotionValue } from '../isMotionValue';
import { applyTransformsStyle } from './styleTransformUtils';

export function applyStyles(
  node: HTMLElement,
  style: Record<string, any>
): (() => void)[] {
  const unsubs: (() => void)[] = [];

  for (const [key, val] of Object.entries(style)) {
    if (isMotionValue(val)) {
      unsubs.push(val.subscribe((v) => applyStyleProps(node, key, v)));
    } else {
      applyStyleProps(node, key, val);
    }
  }

  return unsubs;
}

export function applyAttrs(
  node: HTMLElement,
  props: Record<string, any>
): (() => void)[] {
  const unsubs: (() => void)[] = [];

  for (const [key, val] of Object.entries(props)) {
    const setBool = (v: boolean) => {
      if (v) node.setAttribute(key, '');
      else node.removeAttribute(key);
    };
    const setOther = (v: string | number) => {
      node.setAttribute(key, String(v));
    };

    if (isMotionValue(val)) {
      unsubs.push(
        val.subscribe((v) => {
          if (typeof v === 'boolean') setBool(v);
          else if (typeof v === 'string') setOther(v);
          else if (typeof v === 'number') setOther(v);
          else node.removeAttribute(key);
        })
      );
    } else {
      if (typeof val === 'boolean') setBool(val);
      else if (typeof val === 'string') setOther(val);
      else if (typeof val === 'number') setOther(val);
    }
  }

  return unsubs;
}

export function applyTransforms(
  elRef: HTMLElement,
  txProps: Record<string, any>
): (() => void)[] {
  return applyTransformsStyle(elRef, txProps);
}
