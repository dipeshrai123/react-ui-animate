import { animate, useValue, withTiming } from 'react-ui-animate';
import { useLayoutEffect } from 'react';

export function Loop() {
  const rotateZ = useValue(0, {
    onRest: (value) => {
      if (value === 360) {
        rotateZ.value = withTiming(0, { duration: 0 });
      } else {
        rotateZ.value = withTiming(360, { duration: 5000 });
      }
    },
  });

  useLayoutEffect(() => {
    rotateZ.value = withTiming(360, { duration: 5000 });
  }, []);

  return (
    <animate.div>
      <animate.div
        style={{
          width: 100,
          height: 100,
          backgroundColor: '#3399ff',
          rotateZ: rotateZ.value,
        }}
      />
    </animate.div>
  );
}
