import React, { useState } from 'react';
import {
  animate,
  useValue,
  withSpring,
  withTiming,
  setReducedMotion,
  isReducedMotionEnabled,
} from 'react-ui-animate';
import { ExampleLayout, Section, ExampleCard, Button } from '../shared';

const Example: React.FC = () => {
  const [trigger, setTrigger] = useState(0);
  const [override, setOverride] = useState<'os' | 'on' | 'off'>('os');
  const [x, setX] = useValue(0);

  const applyOverride = (value: 'os' | 'on' | 'off') => {
    setOverride(value);
    setReducedMotion(value === 'os' ? null : value === 'on');
  };

  return (
    <ExampleLayout
      tag="Utility"
      title="Reduced Motion"
      description="timing, spring, and decay (and everything built on them) check the OS-level prefers-reduced-motion setting and, when enabled, resolve straight to the animation's end state instead of animating. Use setReducedMotion to override the media query, and isReducedMotionEnabled to read the current effective value."
      onRestart={() => setTrigger((prev) => prev + 1)}
    >
      <Section
        title="Override the Media Query"
        description="Force reduced motion on or off, or fall back to the OS setting"
      >
        <ExampleCard>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
            <Button
              variant={override === 'os' ? 'primary' : 'secondary'}
              accent="#3399ff"
              onClick={() => applyOverride('os')}
            >
              Follow OS setting
            </Button>
            <Button
              variant={override === 'on' ? 'primary' : 'secondary'}
              accent="#ff6b6b"
              onClick={() => applyOverride('on')}
            >
              Force reduced motion ON
            </Button>
            <Button
              variant={override === 'off' ? 'primary' : 'secondary'}
              accent="#51cf66"
              onClick={() => applyOverride('off')}
            >
              Force reduced motion OFF
            </Button>
          </div>
          <p style={{ marginBottom: 20, fontSize: 14, color: '#9a9aa4' }}>
            <code>isReducedMotionEnabled()</code> currently returns{' '}
            <strong>{String(isReducedMotionEnabled())}</strong>
          </p>

          <animate.div
            key={trigger}
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#3399ff',
              borderRadius: 8,
              translateX: x,
            }}
          />
          <div style={{ marginTop: 20 }}>
            <Button
              variant="primary"
              accent="#845ef7"
              onClick={() => setX(withSpring(x.current === 0 ? 250 : 0))}
            >
              Toggle with withSpring
            </Button>
          </div>
          <p style={{ marginTop: 10, fontSize: 12, color: '#6c6c76' }}>
            When reduced motion is on, the box jumps straight to its target
            position instead of animating
          </p>
        </ExampleCard>
      </Section>

      <Section
        title="Timing Respects Reduced Motion Too"
        description="Every driver — timing, spring, and decay — resolves instantly to the end state when reduced motion is enabled"
      >
        <ExampleCard>
          <animate.div
            key={trigger}
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#ffd43b',
              borderRadius: 8,
              translateX: 0,
            }}
            animate={{
              translateX: withTiming(200, { duration: 600 }),
            }}
          />
          <p style={{ marginTop: 10, fontSize: 12, color: '#6c6c76' }}>
            Force reduced motion ON above, then hit "Restart Animations" —
            the box jumps to 200px immediately instead of sliding
          </p>
        </ExampleCard>
      </Section>
    </ExampleLayout>
  );
};

export default Example;
