import * as React from 'react';

import { ScrollEventType } from '../types';
import { ScrollGesture } from '../controllers';
import { useRecognizer } from './useRecognizer';

export function useScroll(callback: (event: ScrollEventType) => void) {
  const gesture = React.useRef(new ScrollGesture()).current;

  return useRecognizer([['scroll', gesture, callback]]);
}
