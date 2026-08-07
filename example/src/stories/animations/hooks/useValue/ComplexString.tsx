import React from 'react';
import { animate, useValue, withSpring, withTiming } from 'react-ui-animate';
import { ExampleLayout, Section, ExampleCard, Button, ButtonRow } from '../../shared';

const Example: React.FC = () => {
  const [boxShadow, setBoxShadow] = useValue('0px 0px 0px rgba(0, 0, 0, 0)');
  const [border, setBorder] = useValue('2px solid rgba(100, 150, 200, 0.5)');
  const [fontSize, setFontSize] = useValue('16px');
  const [padding, setPadding] = useValue('10px 20px');
  const [transform, setTransform] = useValue('translateX(0px) rotate(0deg) scale(1)');
  const [gradient, setGradient] = useValue('linear-gradient(0deg, #ff0000, #0000ff)');
  const [textShadow, setTextShadow] = useValue('0px 0px 0px rgba(0, 0, 0, 0)');
  const [filter, setFilter] = useValue('blur(0px) brightness(1)');

  return (
    <ExampleLayout
      tag="HOOK"
      title="useValue — complex string values"
      description="useValue interpolates the numeric parts of compound CSS strings — box-shadow, border, transform, gradients, filters — so you can animate them like any other value."
      showRestartButton={false}
    >
      <Section title="Box shadow" description="Animate a multi-part box-shadow string.">
        <ExampleCard align="center">
          <div>
            <ButtonRow>
              <Button variant="primary" onClick={() => setBoxShadow(withSpring('10px 10px 20px rgba(0, 0, 0, 0.5)'))}>
                Deep shadow
              </Button>
              <Button accent="#ff6b6b" onClick={() => setBoxShadow(withTiming('0px 0px 30px rgba(255, 0, 0, 0.8)', { duration: 1000 }))}>
                Red glow
              </Button>
              <Button accent="#51cf66" onClick={() => setBoxShadow(withSpring('5px 5px 10px rgba(0, 255, 0, 0.3)'))}>
                Green shadow
              </Button>
              <Button variant="ghost" onClick={() => setBoxShadow('0px 0px 0px rgba(0, 0, 0, 0)')}>
                Reset
              </Button>
            </ButtonRow>
            <animate.div
              style={{ width: 100, height: 100, backgroundColor: 'white', boxShadow, borderRadius: 8 }}
            />
          </div>
        </ExampleCard>
      </Section>

      <Section title="Border" description="Animate border width, style, and color together.">
        <ExampleCard align="center">
          <div>
            <ButtonRow>
              <Button variant="primary" onClick={() => setBorder(withSpring('5px solid rgba(255, 100, 50, 1)'))}>
                Thick orange
              </Button>
              <Button accent="#3399ff" onClick={() => setBorder(withTiming('1px dashed rgba(50, 200, 255, 0.8)', { duration: 1500 }))}>
                Dashed blue
              </Button>
              <Button accent="#845ef7" onClick={() => setBorder(withSpring('10px double rgba(200, 50, 200, 0.6)'))}>
                Double purple
              </Button>
              <Button variant="ghost" onClick={() => setBorder('2px solid rgba(100, 150, 200, 0.5)')}>
                Reset
              </Button>
            </ButtonRow>
            <animate.div
              style={{ width: 100, height: 100, backgroundColor: 'white', border, borderRadius: 8 }}
            />
          </div>
        </ExampleCard>
      </Section>

      <Section title="Font size" description="Animate a raw font-size string value.">
        <ExampleCard align="center">
          <div>
            <ButtonRow>
              <Button variant="primary" onClick={() => setFontSize(withSpring('32px'))}>
                Large
              </Button>
              <Button accent="#51cf66" onClick={() => setFontSize(withTiming('12px', { duration: 800 }))}>
                Small
              </Button>
              <Button accent="#845ef7" onClick={() => setFontSize(withSpring('24px'))}>
                Medium
              </Button>
              <Button variant="ghost" onClick={() => setFontSize('16px')}>
                Reset
              </Button>
            </ButtonRow>
            <animate.div style={{ fontSize, fontWeight: 'bold', color: '#f4f4f6', padding: 10 }}>
              Animated text
            </animate.div>
          </div>
        </ExampleCard>
      </Section>

      <Section title="Padding" description="Animate a shorthand two-value padding string.">
        <ExampleCard align="center">
          <div>
            <ButtonRow>
              <Button variant="primary" onClick={() => setPadding(withSpring('30px 50px'))}>
                Large padding
              </Button>
              <Button accent="#51cf66" onClick={() => setPadding(withTiming('5px 10px', { duration: 1000 }))}>
                Small padding
              </Button>
              <Button accent="#845ef7" onClick={() => setPadding(withSpring('20px 30px'))}>
                Medium padding
              </Button>
              <Button variant="ghost" onClick={() => setPadding('10px 20px')}>
                Reset
              </Button>
            </ButtonRow>
            <animate.div
              style={{ padding, backgroundColor: '#3399ff', color: 'white', borderRadius: 8, display: 'inline-block' }}
            >
              Padding content
            </animate.div>
          </div>
        </ExampleCard>
      </Section>

      <Section title="Transform" description="Animate translate, rotate, and scale packed into one transform string.">
        <ExampleCard align="center">
          <div>
            <ButtonRow>
              <Button variant="primary" onClick={() => setTransform(withSpring('translateX(100px) rotate(45deg) scale(1.5)'))}>
                Move + rotate + scale
              </Button>
              <Button accent="#51cf66" onClick={() => setTransform(withTiming('translateX(0px) rotate(90deg) scale(0.8)', { duration: 1200 }))}>
                Rotate 90°
              </Button>
              <Button accent="#845ef7" onClick={() => setTransform(withSpring('translateX(-50px) rotate(-30deg) scale(2)'))}>
                Left + rotate + scale
              </Button>
              <Button variant="ghost" onClick={() => setTransform('translateX(0px) rotate(0deg) scale(1)')}>
                Reset
              </Button>
            </ButtonRow>
            <animate.div style={{ width: 100, height: 100, backgroundColor: '#845ef7', borderRadius: 8, transform }} />
          </div>
        </ExampleCard>
      </Section>

      <Section title="Gradient" description="Animate the angle and stops of a linear or radial gradient.">
        <ExampleCard align="center">
          <div>
            <ButtonRow>
              <Button variant="primary" onClick={() => setGradient(withSpring('linear-gradient(90deg, #00ff00, #ff00ff)'))}>
                Green to magenta
              </Button>
              <Button accent="#ffd43b" onClick={() => setGradient(withTiming('linear-gradient(180deg, #ffff00, #0000ff)', { duration: 1500 }))}>
                Yellow to blue
              </Button>
              <Button accent="#ff6b6b" onClick={() => setGradient(withSpring('radial-gradient(circle, rgba(255, 0, 0, 1), rgba(0, 0, 255, 1))'))}>
                Radial red-blue
              </Button>
              <Button variant="ghost" onClick={() => setGradient('linear-gradient(0deg, #ff0000, #0000ff)')}>
                Reset
              </Button>
            </ButtonRow>
            <animate.div style={{ width: 200, height: 100, background: gradient, borderRadius: 8 }} />
          </div>
        </ExampleCard>
      </Section>

      <Section title="Text shadow" description="Animate single and multi-layer text-shadow strings.">
        <ExampleCard align="center">
          <div>
            <ButtonRow>
              <Button variant="primary" onClick={() => setTextShadow(withSpring('2px 2px 4px rgba(0, 0, 0, 0.5)'))}>
                Simple shadow
              </Button>
              <Button
                accent="#ff6b6b"
                onClick={() =>
                  setTextShadow(
                    withTiming('1px 1px 2px rgba(255, 0, 0, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.5)', { duration: 1200 })
                  )
                }
              >
                Multiple shadows
              </Button>
              <Button accent="#51cf66" onClick={() => setTextShadow(withSpring('0px 0px 10px rgba(0, 255, 0, 0.8)'))}>
                Green glow
              </Button>
              <Button variant="ghost" onClick={() => setTextShadow('0px 0px 0px rgba(0, 0, 0, 0)')}>
                Reset
              </Button>
            </ButtonRow>
            <animate.div style={{ fontSize: 24, fontWeight: 'bold', color: '#f4f4f6', padding: 10, textShadow }}>
              Shadowed text
            </animate.div>
          </div>
        </ExampleCard>
      </Section>

      <Section title="Filter" description="Animate blur and brightness together as one CSS filter string.">
        <ExampleCard align="center">
          <div>
            <ButtonRow>
              <Button variant="primary" onClick={() => setFilter(withSpring('blur(5px) brightness(1)'))}>
                Blur
              </Button>
              <Button accent="#51cf66" onClick={() => setFilter(withTiming('blur(0px) brightness(1.5)', { duration: 1000 }))}>
                Brightness
              </Button>
              <Button accent="#845ef7" onClick={() => setFilter(withSpring('blur(3px) brightness(1.2)'))}>
                Combined
              </Button>
              <Button variant="ghost" onClick={() => setFilter('blur(0px) brightness(1)')}>
                Reset
              </Button>
            </ButtonRow>
            <animate.div style={{ width: 100, height: 100, backgroundColor: '#20c997', borderRadius: 8, filter }} />
          </div>
        </ExampleCard>
      </Section>
    </ExampleLayout>
  );
};

export default Example;
