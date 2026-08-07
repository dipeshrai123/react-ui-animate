import React from 'react';
import { animate, useValue, withSpring, withTiming } from 'react-ui-animate';
import { ExampleLayout, Section, ExampleCard, Button, ButtonRow } from '../../shared';

const Example: React.FC = () => {
  const [bg, setBg] = useValue('teal');

  return (
    <ExampleLayout
      tag="HOOK"
      title="useValue — string values"
      description="useValue interpolates color strings directly — no separate color-animation API needed."
      showRestartButton={false}
    >
      <Section title="Color animation" description="Animate between named or hex color strings.">
        <ExampleCard align="center">
          <div>
            <ButtonRow>
              <Button variant="primary" onClick={() => setBg(withSpring('blue'))}>
                Spring to blue
              </Button>
              <Button accent="#845ef7" onClick={() => setBg(withSpring('purple'))}>
                Spring to purple
              </Button>
              <Button accent="#ff6b6b" onClick={() => setBg(withTiming('red', { duration: 2000 }))}>
                Timing to red (2s)
              </Button>
              <Button variant="ghost" onClick={() => setBg('teal')}>
                Immediate to teal
              </Button>
            </ButtonRow>
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
