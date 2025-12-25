import React from 'react';
import { animate, useValue, withSpring, withTiming } from 'react-ui-animate';
import { ExampleLayout, Section, ExampleCard } from '../../shared';

const Example: React.FC = () => {
  const [bg, setBg] = useValue('teal');

  return (
    <ExampleLayout
      title="useValue Hook - String Values"
      description="useValue can animate string values like colors. The library interpolates between color values automatically."
      showRestartButton={false}
    >
      <Section title="Color Animation" description="Animate between color strings">
        <ExampleCard>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
              <button
                onClick={() => setBg(withSpring('blue'))}
                style={{
                  padding: '8px 16px',
                  fontSize: 14,
                  backgroundColor: '#3399ff',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                Spring to Blue
              </button>
              <button
                onClick={() => setBg(withSpring('purple'))}
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
                Spring to Purple
              </button>
              <button
                onClick={() => setBg(withTiming('red', { duration: 2000 }))}
                style={{
                  padding: '8px 16px',
                  fontSize: 14,
                  backgroundColor: '#ff6b6b',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                Timing to Red (2s)
              </button>
              <button
                onClick={() => setBg('teal')}
                style={{
                  padding: '8px 16px',
                  fontSize: 14,
                  backgroundColor: '#20c997',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                Immediate to Teal
              </button>
            </div>
            <animate.div
              style={{
                width: 200,
                height: 200,
                backgroundColor: bg,
                borderRadius: 8,
              }}
            />
          </div>
        </ExampleCard>
      </Section>
    </ExampleLayout>
  );
};

export default Example;
