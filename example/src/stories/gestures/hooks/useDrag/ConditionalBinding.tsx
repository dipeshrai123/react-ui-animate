import { useRef, useState } from 'react';
import { useValue, animate, useDrag, withSpring } from 'react-ui-animate';

const Example = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [translateX, setTranslateX] = useValue(0);

  const [isEnabled, setIsEnabled] = useState(true);

  useDrag(ref, ({ down, movement }) => {
    if (isEnabled) {
      setTranslateX(down ? withSpring(movement.x) : withSpring(0));
    }
  });

  return (
    <>
      <button className="mb" onClick={() => setIsEnabled((p) => !p)}>
        {isEnabled ? 'Disable' : 'Enable'}
      </button>

      <animate.div
        ref={ref}
        style={{
          translateX,
          width: translateX.to([0, 100], [100, 200]),
          height: 100,
          backgroundColor: 'teal',
          borderRadius: 4,
        }}
      />
    </>
  );
};

export default Example;
