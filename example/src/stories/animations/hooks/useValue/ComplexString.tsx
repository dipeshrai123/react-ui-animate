import React from 'react';
import { animate, useValue, withSpring, withTiming } from 'react-ui-animate';
import { ExampleLayout, Section, ExampleCard } from '../../shared';

const Example: React.FC = () => {
  const [boxShadow, setBoxShadow] = useValue('0px 0px 0px rgba(0, 0, 0, 0)');
  const [border, setBorder] = useValue('2px solid rgba(100, 150, 200, 0.5)');
  const [fontSize, setFontSize] = useValue('16px');
  const [padding, setPadding] = useValue('10px 20px');
  const [transform, setTransform] = useValue('translateX(0px) rotate(0deg) scale(1)');
  const [gradient, setGradient] = useValue('linear-gradient(0deg, #ff0000, #0000ff)');
  const [textShadow, setTextShadow] = useValue('0px 0px 0px rgba(0, 0, 0, 0)');
  const [filter, setFilter] = useValue('blur(0px) brightness(1)');

  const buttonStyle = {
    padding: '8px 16px',
    fontSize: 14,
    backgroundColor: '#3399ff',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
  };

  return (
    <ExampleLayout
      title="useValue Hook - Complex String Values"
      description="useValue can animate complex CSS string values like box-shadow, border, transform, gradients, and more. The library interpolates numeric values within these strings."
      showRestartButton={false}
    >
      <Section title="Box Shadow Animation" description="Animate box-shadow values">
        <ExampleCard>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
              <button
                onClick={() => setBoxShadow(withSpring('10px 10px 20px rgba(0, 0, 0, 0.5)'))}
                style={buttonStyle}
              >
                Deep Shadow
              </button>
              <button
                onClick={() =>
                  setBoxShadow(
                    withTiming('0px 0px 30px rgba(255, 0, 0, 0.8)', { duration: 1000 })
                  )
                }
                style={buttonStyle}
              >
                Red Glow
              </button>
              <button
                onClick={() => setBoxShadow(withSpring('5px 5px 10px rgba(0, 255, 0, 0.3)'))}
                style={buttonStyle}
              >
                Green Shadow
              </button>
              <button
                onClick={() => setBoxShadow('0px 0px 0px rgba(0, 0, 0, 0)')}
                style={{ ...buttonStyle, backgroundColor: '#999' }}
              >
                Reset
              </button>
            </div>
            <animate.div
              style={{
                width: 100,
                height: 100,
                backgroundColor: 'white',
                boxShadow: boxShadow,
                borderRadius: 8,
              }}
            />
          </div>
        </ExampleCard>
      </Section>

      <Section title="Border Animation" description="Animate border styles">
        <ExampleCard>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
              <button
                onClick={() => setBorder(withSpring('5px solid rgba(255, 100, 50, 1)'))}
                style={buttonStyle}
              >
                Thick Orange
              </button>
              <button
                onClick={() =>
                  setBorder(
                    withTiming('1px dashed rgba(50, 200, 255, 0.8)', { duration: 1500 })
                  )
                }
                style={buttonStyle}
              >
                Dashed Blue
              </button>
              <button
                onClick={() => setBorder(withSpring('10px double rgba(200, 50, 200, 0.6)'))}
                style={buttonStyle}
              >
                Double Purple
              </button>
              <button
                onClick={() => setBorder('2px solid rgba(100, 150, 200, 0.5)')}
                style={{ ...buttonStyle, backgroundColor: '#999' }}
              >
                Reset
              </button>
            </div>
            <animate.div
              style={{
                width: 100,
                height: 100,
                backgroundColor: 'white',
                border: border,
                borderRadius: 8,
              }}
            />
          </div>
        </ExampleCard>
      </Section>

      <Section title="Font Size Animation" description="Animate font-size values">
        <ExampleCard>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
              <button onClick={() => setFontSize(withSpring('32px'))} style={buttonStyle}>
                Large
              </button>
              <button
                onClick={() => setFontSize(withTiming('12px', { duration: 800 }))}
                style={buttonStyle}
              >
                Small
              </button>
              <button onClick={() => setFontSize(withSpring('24px'))} style={buttonStyle}>
                Medium
              </button>
              <button
                onClick={() => setFontSize('16px')}
                style={{ ...buttonStyle, backgroundColor: '#999' }}
              >
                Reset
              </button>
            </div>
            <animate.div
              style={{
                fontSize: fontSize,
                fontWeight: 'bold',
                color: '#333',
                padding: '10px',
              }}
            >
              Animated Text
            </animate.div>
          </div>
        </ExampleCard>
      </Section>

      <Section title="Padding Animation" description="Animate padding with multiple values">
        <ExampleCard>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
              <button
                onClick={() => setPadding(withSpring('30px 50px'))}
                style={buttonStyle}
              >
                Large Padding
              </button>
              <button
                onClick={() => setPadding(withTiming('5px 10px', { duration: 1000 }))}
                style={buttonStyle}
              >
                Small Padding
              </button>
              <button
                onClick={() => setPadding(withSpring('20px 30px'))}
                style={buttonStyle}
              >
                Medium Padding
              </button>
              <button
                onClick={() => setPadding('10px 20px')}
                style={{ ...buttonStyle, backgroundColor: '#999' }}
              >
                Reset
              </button>
            </div>
            <animate.div
              style={{
                padding: padding,
                backgroundColor: '#3399ff',
                color: 'white',
                borderRadius: 8,
                display: 'inline-block',
              }}
            >
              Padding Content
            </animate.div>
          </div>
        </ExampleCard>
      </Section>

      <Section title="Transform Animation" description="Animate complex transform strings">
        <ExampleCard>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
              <button
                onClick={() =>
                  setTransform(
                    withSpring('translateX(100px) rotate(45deg) scale(1.5)')
                  )
                }
                style={buttonStyle}
              >
                Move + Rotate + Scale
              </button>
              <button
                onClick={() =>
                  setTransform(
                    withTiming('translateX(0px) rotate(90deg) scale(0.8)', {
                      duration: 1200,
                    })
                  )
                }
                style={buttonStyle}
              >
                Rotate 90°
              </button>
              <button
                onClick={() =>
                  setTransform(
                    withSpring('translateX(-50px) rotate(-30deg) scale(2)')
                  )
                }
                style={buttonStyle}
              >
                Left + Rotate + Scale
              </button>
              <button
                onClick={() => setTransform('translateX(0px) rotate(0deg) scale(1)')}
                style={{ ...buttonStyle, backgroundColor: '#999' }}
              >
                Reset
              </button>
            </div>
            <animate.div
              style={{
                width: 100,
                height: 100,
                backgroundColor: '#845ef7',
                borderRadius: 8,
                transform: transform,
              }}
            />
          </div>
        </ExampleCard>
      </Section>

      <Section title="Gradient Animation" description="Animate linear and radial gradients">
        <ExampleCard>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
              <button
                onClick={() =>
                  setGradient(withSpring('linear-gradient(90deg, #00ff00, #ff00ff)'))
                }
                style={buttonStyle}
              >
                Green to Magenta
              </button>
              <button
                onClick={() =>
                  setGradient(
                    withTiming('linear-gradient(180deg, #ffff00, #0000ff)', {
                      duration: 1500,
                    })
                  )
                }
                style={buttonStyle}
              >
                Yellow to Blue
              </button>
              <button
                onClick={() =>
                  setGradient(
                    withSpring('radial-gradient(circle, rgba(255, 0, 0, 1), rgba(0, 0, 255, 1))')
                  )
                }
                style={buttonStyle}
              >
                Radial Red-Blue
              </button>
              <button
                onClick={() => setGradient('linear-gradient(0deg, #ff0000, #0000ff)')}
                style={{ ...buttonStyle, backgroundColor: '#999' }}
              >
                Reset
              </button>
            </div>
            <animate.div
              style={{
                width: 200,
                height: 100,
                background: gradient,
                borderRadius: 8,
              }}
            />
          </div>
        </ExampleCard>
      </Section>

      <Section title="Text Shadow Animation" description="Animate text-shadow values">
        <ExampleCard>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
              <button
                onClick={() =>
                  setTextShadow(withSpring('2px 2px 4px rgba(0, 0, 0, 0.5)'))
                }
                style={buttonStyle}
              >
                Simple Shadow
              </button>
              <button
                onClick={() =>
                  setTextShadow(
                    withTiming(
                      '1px 1px 2px rgba(255, 0, 0, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.5)',
                      { duration: 1200 }
                    )
                  )
                }
                style={buttonStyle}
              >
                Multiple Shadows
              </button>
              <button
                onClick={() =>
                  setTextShadow(withSpring('0px 0px 10px rgba(0, 255, 0, 0.8)'))
                }
                style={buttonStyle}
              >
                Green Glow
              </button>
              <button
                onClick={() => setTextShadow('0px 0px 0px rgba(0, 0, 0, 0)')}
                style={{ ...buttonStyle, backgroundColor: '#999' }}
              >
                Reset
              </button>
            </div>
            <animate.div
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#333',
                padding: '10px',
                textShadow: textShadow,
              }}
            >
              Shadowed Text
            </animate.div>
          </div>
        </ExampleCard>
      </Section>

      <Section title="Filter Animation" description="Animate CSS filter values">
        <ExampleCard>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
              <button
                onClick={() => setFilter(withSpring('blur(5px) brightness(1)'))}
                style={buttonStyle}
              >
                Blur
              </button>
              <button
                onClick={() =>
                  setFilter(withTiming('blur(0px) brightness(1.5)', { duration: 1000 }))
                }
                style={buttonStyle}
              >
                Brightness
              </button>
              <button
                onClick={() => setFilter(withSpring('blur(3px) brightness(1.2)'))}
                style={buttonStyle}
              >
                Combined
              </button>
              <button
                onClick={() => setFilter('blur(0px) brightness(1)')}
                style={{ ...buttonStyle, backgroundColor: '#999' }}
              >
                Reset
              </button>
            </div>
            <animate.div
              style={{
                width: 100,
                height: 100,
                backgroundColor: '#20c997',
                borderRadius: 8,
                filter: filter,
              }}
            />
          </div>
        </ExampleCard>
      </Section>
    </ExampleLayout>
  );
};

export default Example;
