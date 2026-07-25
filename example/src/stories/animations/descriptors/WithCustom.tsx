import React, { useEffect, useState } from 'react';
import {
  animate,
  useValue,
  withCustom,
  withParallel,
  withSequence,
  withSpring,
} from 'react-ui-animate';
import { ExampleLayout, Section, ExampleCard } from '../shared';

const Example: React.FC = () => {
  const [trigger, setTrigger] = useState(0);

  return (
    <ExampleLayout
      title="withCustom Descriptor"
      description={
        <>
          Escape hatch for animation shapes the built-in drivers don't model.
          <code>tick</code> is called every frame with{' '}
          <code>{'{ elapsed, dt, from }'}</code> and returns the value for
          that frame — it still gets the same start/pause/resume/cancel/reset
          controls and composes with <code>withSequence</code>/
          <code>withParallel</code>/<code>withLoop</code> like any other
          driver.
        </>
      }
      onRestart={() => setTrigger((prev) => prev + 1)}
    >
      <Section
        title="Basic Custom Tick"
        description="Manually integrates position from `elapsed` — equivalent to a linear withTiming, but expressed as a raw function"
      >
        <ExampleCard>
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
        </ExampleCard>
      </Section>

      <Section
        title="Custom Easing Curve (Bounce)"
        description="A one-off easing curve that isn't in Easing — no need to register it anywhere, just write the math"
      >
        <ExampleCard>
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
                    t < 1
                      ? 1 - Math.pow(2, -8 * t) * Math.abs(Math.cos(t * 12))
                      : 1;
                  return from + bounce * 250;
                },
                { duration: 900 }
              ),
            }}
          />
        </ExampleCard>
      </Section>

      <Section
        title="Composed with withSequence + withSpring"
        description="Decaying shake (custom) for 400ms, then a spring settle to 200px"
      >
        <ExampleCard>
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
                withCustom(
                  ({ elapsed, from }) =>
                    from + Math.sin(elapsed / 20) * (1 - elapsed / 400) * 30,
                  { duration: 400 }
                ),
                withSpring(200, { stiffness: 200, damping: 18 }),
              ]),
            }}
          />
        </ExampleCard>
      </Section>

      <OrbitExample trigger={trigger} />
    </ExampleLayout>
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
    <Section
      title="Indefinite Driver (Orbit)"
      description="Omitting `duration` never calls `onComplete` — the driver ticks forever, stopped only by `controls.cancel()` on unmount"
    >
      <ExampleCard>
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
      </ExampleCard>
    </Section>
  );
};

export default Example;
