import React, { useState } from 'react';
import {
  animate,
  useValue,
  withParallel,
  withSpring,
  withTiming,
  withDecay,
} from 'react-ui-animate';
import { ExampleLayout, Section, ExampleCard, Button } from '../shared';

const Example: React.FC = () => {
  const [trigger, setTrigger] = useState(0);
  const [pos, setPos] = useValue({ x: 0, y: 0 });

  return (
    <ExampleLayout
      title="withParallel Descriptor"
      description={
        <>
          Runs a <em>different</em> descriptor per key of an object/array{' '}
          <code>useValue</code>, concurrently. A plain descriptor passed to an
          object/array value already animates every key at once, but shares
          one driver and options across all of them — <code>withParallel</code>{' '}
          is for when keys need different drivers or options, e.g. one
          property springs while another tweens.
        </>
      }
      tag="Descriptor"
      onRestart={() => setTrigger((prev) => prev + 1)}
    >
      <Section
        title="Baseline: Independent Style Props Already Run in Parallel"
        description={
          <>
            x springs (with overshoot) while y tweens linearly — each style
            prop on <code>animate.div</code> is its own value, so this needs
            no <code>withParallel</code> at all. It's only when a{' '}
            <em>single</em> object/array <code>useValue</code> needs mixed
            drivers per key (below) that <code>withParallel</code> earns its
            keep.
          </>
        }
      >
        <ExampleCard>
          <div
            style={{
              position: 'relative',
              width: 400,
              height: 200,
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8,
              backgroundColor: '#131317',
            }}
          >
            <animate.div
              key={trigger}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: 60,
                height: 60,
                backgroundColor: '#3399ff',
                borderRadius: '50%',
                translateX: 0,
                translateY: 0,
              }}
              animate={{
                translateX: withSpring(300, { stiffness: 120, damping: 14 }),
                translateY: withTiming(120, { duration: 900 }),
              }}
            />
          </div>
        </ExampleCard>
      </Section>

      <Section
        title="Driving an Object Value with withParallel"
        description={
          <>
            <code>setPos</code> here is a single{' '}
            <code>useValue({'{ x, y }'})</code> setter — <code>withParallel</code>{' '}
            lets x and y run different drivers off one call, with one{' '}
            <code>Controls</code> object for both (pause/cancel affects the
            whole pair).
          </>
        }
      >
        <ExampleCard>
          <div
            style={{
              position: 'relative',
              width: 400,
              height: 200,
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8,
              backgroundColor: '#131317',
              marginBottom: 20,
            }}
          >
            <animate.div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: 60,
                height: 60,
                backgroundColor: '#845ef7',
                borderRadius: '50%',
                translateX: pos.x,
                translateY: pos.y,
              }}
            />
          </div>
          <Button
            variant="primary"
            accent="#845ef7"
            onClick={() =>
              setPos(
                withParallel({
                  x: withSpring(300, { stiffness: 150, damping: 12 }),
                  y: withDecay(2, { clamp: [0, 130] }),
                })
              )
            }
          >
            Spring x, Decay y — in parallel
          </Button>
        </ExampleCard>
      </Section>
    </ExampleLayout>
  );
};

export default Example;
