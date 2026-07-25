import { MouseEvent, useLayoutEffect, useState } from 'react';
import { animate, useValue, withTiming } from 'react-ui-animate';
import { ExampleLayout } from '../animations/shared';

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
        onComplete: () => {
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

function Example() {
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
    <ExampleLayout
      title="Ripple Effect Button"
      description="A button with beautiful ripple effects that expand from the click position. Each click creates a new ripple animation."
      onRestart={() => setRipples([])}
      showRestartButton={false}
    >
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
        <button
          onClick={addRipple}
          style={{
            backgroundColor: '#3399ff',
            border: 'none',
            position: 'relative',
            overflow: 'hidden',
            padding: '16px 32px',
            borderRadius: 8,
            color: 'white',
            cursor: 'pointer',
            fontSize: 16,
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(51, 153, 255, 0.3)',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Click Me
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
      </div>
    </ExampleLayout>
  );
}

export default Example;
