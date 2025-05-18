import { MouseEvent, useLayoutEffect, useState } from 'react';
import { animate, useValue, withTiming } from 'react-ui-animate';

import '../../index.css';

const RIPPLE_SIZE = 50;

function Ripple({
  id,
  x,
  y,
  onRemove,
}: {
  id: number;
  x: number;
  y: number;
  onRemove: (id: number) => void;
}) {
  const [animation, setAnimation] = useValue(0);

  useLayoutEffect(() => {
    setAnimation(
      withTiming(1, {
        duration: 800,
        onRest: () => {
          onRemove(id);
        },
      })
    );
  }, [id, setAnimation, onRemove]);

  return (
    <animate.div
      style={{
        width: RIPPLE_SIZE,
        height: RIPPLE_SIZE,
        borderRadius: RIPPLE_SIZE / 2,
        position: 'absolute',
        left: x,
        top: y,
        backgroundColor: 'white',
        scale: animation.to([0, 1], [0, 4]),
        opacity: animation.to([0, 1], [1, 0]),
        userSelect: 'none',
      }}
    />
  );
}

let _uniqueId = 0;

export function RippleButton() {
  const [ripples, setRipples] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);

  const addRipple = ({
    clientX,
    clientY,
    currentTarget,
  }: MouseEvent<HTMLButtonElement>) => {
    const { left, top } = currentTarget.getBoundingClientRect();

    setRipples((previousRipples) => [
      ...previousRipples,
      {
        id: _uniqueId++,
        x: clientX - left - RIPPLE_SIZE / 2,
        y: clientY - top - RIPPLE_SIZE / 2,
      },
    ]);
  };

  const removeRipple = (id: number) => {
    setRipples((prevRipples) =>
      prevRipples.filter((ripple) => ripple.id !== id)
    );
  };

  return (
    <button
      onClick={addRipple}
      style={{
        backgroundColor: '#3399ff',
        border: 'none',
        fontSize: 18,
        width: 200,
        position: 'relative',
        overflow: 'hidden',
        padding: 20,
        borderRadius: 40,
        color: 'white',
        boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
        cursor: 'pointer',
      }}
    >
      Click me
      {ripples.map(({ id, x, y }) => (
        <Ripple
          key={id}
          x={x}
          y={y}
          id={id}
          onRemove={(id) => removeRipple(id)}
        />
      ))}
    </button>
  );
}
