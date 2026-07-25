import React, { useEffect, useState } from 'react';
import {
  animate,
  useValue,
  withCustom,
  withParallel,
  withSequence,
  withSpring,
} from 'react-ui-animate';

const Example: React.FC = () => {
  const [trigger, setTrigger] = useState(0);

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 30 }}>withCustom Descriptor</h1>
      <p style={{ marginBottom: 40, color: '#666' }}>
        Escape hatch for animation shapes the built-in drivers don't model.
        `tick` is called every frame with <code>{'{ elapsed, dt, from }'}</code>{' '}
        and returns the value for that frame — it still gets the same
        start/pause/resume/cancel/reset controls and composes with{' '}
        <code>withSequence</code>/<code>withParallel</code>/<code>withLoop</code>{' '}
        like any other driver.
      </p>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>Basic Custom Tick</h2>
        <animate.div
          key={trigger}
          style={{
            width: 100,
            height: 100,
            backgroundColor: '#3399ff',
            borderRadius: 8,
            translateX: 0,
          }}
          animate={{
            translateX: withCustom(
              ({ elapsed, from }) => from + Math.min(elapsed / 3, 200),
              { duration: 600 }
            ),
          }}
        />
        <p style={{ marginTop: 10, fontSize: 12, color: '#999' }}>
          Manually integrates position from `elapsed` — equivalent to a
          linear <code>withTiming</code>, but expressed as a raw function
        </p>
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>Custom Easing Curve (Bounce)</h2>
        <animate.div
          key={trigger}
          style={{
            width: 100,
            height: 100,
            backgroundColor: '#ff6b6b',
            borderRadius: 8,
            translateX: 0,
          }}
          animate={{
            translateX: withCustom(
              ({ elapsed, from }) => {
                const duration = 900;
                const t = Math.min(elapsed / duration, 1);
                const bounce =
                  t < 1 ? 1 - Math.pow(2, -8 * t) * Math.abs(Math.cos(t * 12)) : 1;
                return from + bounce * 250;
              },
              { duration: 900 }
            ),
          }}
        />
        <p style={{ marginTop: 10, fontSize: 12, color: '#999' }}>
          A one-off easing curve that isn't in `Easing` — no need to register
          it anywhere, just write the math
        </p>
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>Composed with withSequence + withSpring</h2>
        <animate.div
          key={trigger}
          style={{
            width: 100,
            height: 100,
            backgroundColor: '#845ef7',
            borderRadius: 8,
            translateX: 0,
          }}
          animate={{
            translateX: withSequence([
              // Custom shake, then settle with a normal spring — the two
              // driver kinds chain exactly like withTiming + withSpring would.
              withCustom(
                ({ elapsed, from }) =>
                  from + Math.sin(elapsed / 20) * (1 - elapsed / 400) * 30,
                { duration: 400 }
              ),
              withSpring(200, { stiffness: 200, damping: 18 }),
            ]),
          }}
        />
        <p style={{ marginTop: 10, fontSize: 12, color: '#999' }}>
          Decaying shake (custom) for 400ms, then a spring settle to 200px
        </p>
      </div>

      <OrbitExample trigger={trigger} />

      <div style={{ marginTop: 40 }}>
        <button
          onClick={() => setTrigger((prev) => prev + 1)}
          style={{
            padding: '12px 24px',
            fontSize: 16,
            backgroundColor: '#3399ff',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          Restart Animations
        </button>
      </div>
    </div>
  );
};

// Indefinite driver (no `duration`) — keeps ticking every frame until
// `cancel()` is called, which is exactly what a continuous orbit needs.
const OrbitExample: React.FC<{ trigger: number }> = ({ trigger }) => {
  const [position, setPosition, controls] = useValue({ x: 0, y: 0 });

  useEffect(() => {
    const radius = 60;

    setPosition(
      withParallel({
        x: withCustom(({ elapsed }) => Math.cos(elapsed / 500) * radius),
        y: withCustom(({ elapsed }) => Math.sin(elapsed / 500) * radius),
      })
    );

    return () => controls.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ marginBottom: 20 }}>Indefinite Driver (Orbit)</h2>
      <div
        style={{
          width: 200,
          height: 200,
          border: '1px dashed #ccc',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <animate.div
          style={{
            width: 30,
            height: 30,
            backgroundColor: '#20c997',
            borderRadius: '50%',
            translateX: position.x,
            translateY: position.y,
          }}
        />
      </div>
      <p style={{ marginTop: 10, fontSize: 12, color: '#999' }}>
        Omitting `duration` never calls `onComplete` — the driver ticks
        forever, stopped only by `controls.cancel()` on unmount
      </p>
    </div>
  );
};

export default Example;
