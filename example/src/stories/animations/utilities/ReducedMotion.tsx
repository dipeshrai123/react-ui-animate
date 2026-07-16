import React, { useState } from 'react';
import {
  animate,
  useValue,
  withSpring,
  withTiming,
  setReducedMotion,
  isReducedMotionEnabled,
} from 'react-ui-animate';
import { ExampleLayout, Section, ExampleCard } from '../shared';

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
      title="Reduced Motion"
      description="timing, spring, and decay (and everything built on them) check the OS-level prefers-reduced-motion setting and, when enabled, resolve straight to the animation's end state instead of animating. Use setReducedMotion to override the media query, and isReducedMotionEnabled to read the current effective value."
      onRestart={() => setTrigger((prev) => prev + 1)}
    >
      <Section
        title="Override the Media Query"
        description="Force reduced motion on or off, or fall back to the OS setting"
      >
        <ExampleCard>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <button
              onClick={() => applyOverride('os')}
              style={{
                padding: '8px 16px',
                fontSize: 14,
                backgroundColor: override === 'os' ? '#3399ff' : '#e0e0e0',
                color: override === 'os' ? 'white' : '#333',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              Follow OS setting
            </button>
            <button
              onClick={() => applyOverride('on')}
              style={{
                padding: '8px 16px',
                fontSize: 14,
                backgroundColor: override === 'on' ? '#ff6b6b' : '#e0e0e0',
                color: override === 'on' ? 'white' : '#333',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              Force reduced motion ON
            </button>
            <button
              onClick={() => applyOverride('off')}
              style={{
                padding: '8px 16px',
                fontSize: 14,
                backgroundColor: override === 'off' ? '#51cf66' : '#e0e0e0',
                color: override === 'off' ? 'white' : '#333',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              Force reduced motion OFF
            </button>
          </div>
          <p style={{ marginBottom: 20, fontSize: 14, color: '#666' }}>
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
            <button
              onClick={() => setX(withSpring(x.current === 0 ? 250 : 0))}
              style={{
                padding: '8px 16px',
                fontSize: 14,
                backgroundColor: '#845ef7',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              Toggle with withSpring
            </button>
          </div>
          <p style={{ marginTop: 10, fontSize: 12, color: '#999' }}>
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
          <p style={{ marginTop: 10, fontSize: 12, color: '#999' }}>
            Force reduced motion ON above, then hit "Restart Animations" —
            the box jumps to 200px immediately instead of sliding
          </p>
        </ExampleCard>
      </Section>
    </ExampleLayout>
  );
};

export default Example;
