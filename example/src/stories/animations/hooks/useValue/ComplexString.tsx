import React from 'react';
import { animate, useValue, withSpring, withTiming } from 'react-ui-animate';

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
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Box Shadow Animation */}
        <div>
          <h3 style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
            Box Shadow Animation
          </h3>
          <div className="button-group mb">
            <button
              onClick={() =>
                setBoxShadow(
                  withSpring('10px 10px 20px rgba(0, 0, 0, 0.5)')
                )
              }
            >
              Deep Shadow
            </button>
            <button
              onClick={() =>
                setBoxShadow(
                  withTiming('0px 0px 30px rgba(255, 0, 0, 0.8)', {
                    duration: 1000,
                  })
                )
              }
            >
              Red Glow
            </button>
            <button
              onClick={() =>
                setBoxShadow(
                  withSpring('5px 5px 10px rgba(0, 255, 0, 0.3)')
                )
              }
            >
              Green Shadow
            </button>
            <button onClick={() => setBoxShadow('0px 0px 0px rgba(0, 0, 0, 0)')}>
              Reset
            </button>
          </div>
          <animate.div
            style={{
              width: 100,
              height: 100,
              backgroundColor: 'white',
              boxShadow: boxShadow,
              borderRadius: 4,
            }}
          />
        </div>

        {/* Border Animation */}
        <div>
          <h3 style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
            Border Animation
          </h3>
          <div className="button-group mb">
            <button
              onClick={() =>
                setBorder(
                  withSpring('5px solid rgba(255, 100, 50, 1)')
                )
              }
            >
              Thick Orange
            </button>
            <button
              onClick={() =>
                setBorder(
                  withTiming('1px dashed rgba(50, 200, 255, 0.8)', {
                    duration: 1500,
                  })
                )
              }
            >
              Dashed Blue
            </button>
            <button
              onClick={() =>
                setBorder(
                  withSpring('10px double rgba(200, 50, 200, 0.6)')
                )
              }
            >
              Double Purple
            </button>
            <button onClick={() => setBorder('2px solid rgba(100, 150, 200, 0.5)')}>
              Reset
            </button>
          </div>
          <animate.div
            style={{
              width: 100,
              height: 100,
              backgroundColor: 'white',
              border: border,
              borderRadius: 4,
            }}
          />
        </div>

        {/* Font Size Animation */}
        <div>
          <h3 style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
            Font Size Animation
          </h3>
          <div className="button-group mb">
            <button
              onClick={() => setFontSize(withSpring('32px'))}>
              Large
            </button>
            <button
              onClick={() =>
                setFontSize(withTiming('12px', { duration: 800 }))
              }
            >
              Small
            </button>
            <button
              onClick={() => setFontSize(withSpring('24px'))}>
              Medium
            </button>
            <button onClick={() => setFontSize('16px')}>Reset</button>
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

        {/* Padding Animation */}
        <div>
          <h3 style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
            Padding Animation (Multiple Values)
          </h3>
          <div className="button-group mb">
            <button
              onClick={() => setPadding(withSpring('30px 50px'))}>
              Large Padding
            </button>
            <button
              onClick={() =>
                setPadding(withTiming('5px 10px', { duration: 1000 }))
              }
            >
              Small Padding
            </button>
            <button
              onClick={() => setPadding(withSpring('20px 30px'))}>
              Medium Padding
            </button>
            <button onClick={() => setPadding('10px 20px')}>Reset</button>
          </div>
          <animate.div
            style={{
              padding: padding,
              backgroundColor: 'teal',
              color: 'white',
              borderRadius: 4,
              display: 'inline-block',
            }}
          >
            Padding Content
          </animate.div>
        </div>

        {/* Transform Animation */}
        <div>
          <h3 style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
            Complex Transform Animation
          </h3>
          <div className="button-group mb">
            <button
              onClick={() =>
                setTransform(
                  withSpring('translateX(100px) rotate(45deg) scale(1.5)')
                )
              }
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
            >
              Rotate 90°
            </button>
            <button
              onClick={() =>
                setTransform(
                  withSpring('translateX(-50px) rotate(-30deg) scale(2)')
                )
              }
            >
              Left + Rotate + Scale
            </button>
            <button onClick={() => setTransform('translateX(0px) rotate(0deg) scale(1)')}>
              Reset
            </button>
          </div>
          <animate.div
            style={{
              width: 100,
              height: 100,
              backgroundColor: 'purple',
              transform: transform,
              borderRadius: 4,
            }}
          />
        </div>

        {/* Gradient Animation */}
        <div>
          <h3 style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
            Gradient Animation
          </h3>
          <div className="button-group mb">
            <button
              onClick={() =>
                setGradient(
                  withSpring('linear-gradient(90deg, #00ff00, #ff00ff)')
                )
              }
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
            >
              Yellow to Blue
            </button>
            <button
              onClick={() =>
                setGradient(
                  withSpring('linear-gradient(45deg, #ff0000, #00ffff)')
                )
              }
            >
              Red to Cyan
            </button>
            <button onClick={() => setGradient('linear-gradient(0deg, #ff0000, #0000ff)')}>
              Reset
            </button>
          </div>
          <animate.div
            style={{
              width: 200,
              height: 100,
              background: gradient,
              borderRadius: 4,
            }}
          />
        </div>

        {/* Complex Box Shadow with Inset */}
        <div>
          <h3 style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
            Box Shadow with Inset
          </h3>
          <div className="button-group mb">
            <button
              onClick={() =>
                setBoxShadow(
                  withSpring('inset 5px 5px 10px rgba(0, 0, 0, 0.3)')
                )
              }
            >
              Inset Shadow
            </button>
            <button
              onClick={() =>
                setBoxShadow(
                  withTiming('0px 0px 20px rgba(255, 0, 0, 0.6)', {
                    duration: 1000,
                  })
                )
              }
            >
              Outer Glow
            </button>
            <button
              onClick={() =>
                setBoxShadow(
                  withSpring('inset 0px 0px 30px rgba(0, 255, 0, 0.5)')
                )
              }
            >
              Inset Green
            </button>
            <button onClick={() => setBoxShadow('0px 0px 0px rgba(0, 0, 0, 0)')}>
              Reset
            </button>
          </div>
          <animate.div
            style={{
              width: 100,
              height: 100,
              backgroundColor: 'white',
              boxShadow: boxShadow,
              borderRadius: 4,
            }}
          />
        </div>

        {/* Multiple Border Styles */}
        <div>
          <h3 style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
            Multiple Border Styles
          </h3>
          <div className="button-group mb">
            <button
              onClick={() =>
                setBorder(
                  withSpring('3px dotted rgba(255, 100, 50, 0.8)')
                )
              }
            >
              Dotted
            </button>
            <button
              onClick={() =>
                setBorder(
                  withTiming('4px groove rgba(50, 200, 255, 0.7)', {
                    duration: 1200,
                  })
                )
              }
            >
              Groove
            </button>
            <button
              onClick={() =>
                setBorder(
                  withSpring('5px ridge rgba(200, 50, 200, 0.9)')
                )
              }
            >
              Ridge
            </button>
            <button
              onClick={() =>
                setBorder(
                  withTiming('2px inset rgba(100, 150, 200, 0.6)', {
                    duration: 1000,
                  })
                )
              }
            >
              Inset
            </button>
            <button onClick={() => setBorder('2px solid rgba(100, 150, 200, 0.5)')}>
              Reset
            </button>
          </div>
          <animate.div
            style={{
              width: 100,
              height: 100,
              backgroundColor: 'white',
              border: border,
              borderRadius: 4,
            }}
          />
        </div>

        {/* Complex Transform with Matrix */}
        <div>
          <h3 style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
            Matrix Transform
          </h3>
          <div className="button-group mb">
            <button
              onClick={() =>
                setTransform(
                  withSpring('matrix(1, 0, 0, 1, 0, 0)')
                )
              }
            >
              Identity
            </button>
            <button
              onClick={() =>
                setTransform(
                  withTiming('matrix(1.5, 0.5, -0.5, 1.5, 50, 50)', {
                    duration: 1500,
                  })
                )
              }
            >
              Skew + Scale
            </button>
            <button
              onClick={() =>
                setTransform(
                  withSpring('matrix(2, 0, 0, 2, 100, 0)')
                )
              }
            >
              Scale + Translate
            </button>
            <button onClick={() => setTransform('translateX(0px) rotate(0deg) scale(1)')}>
              Reset
            </button>
          </div>
          <animate.div
            style={{
              width: 100,
              height: 100,
              backgroundColor: 'orange',
              transform: transform,
              borderRadius: 4,
            }}
          />
        </div>

        {/* Radial Gradient */}
        <div>
          <h3 style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
            Radial Gradient
          </h3>
          <div className="button-group mb">
            <button
              onClick={() =>
                setGradient(
                  withSpring('radial-gradient(circle, rgba(255, 0, 0, 1), rgba(0, 0, 255, 1))')
                )
              }
            >
              Circle Red-Blue
            </button>
            <button
              onClick={() =>
                setGradient(
                  withTiming('radial-gradient(ellipse, rgba(0, 255, 0, 1), rgba(255, 0, 255, 1))', {
                    duration: 1500,
                  })
                )
              }
            >
              Ellipse Green-Magenta
            </button>
            <button
              onClick={() =>
                setGradient(
                  withSpring('radial-gradient(circle at 50% 50%, rgba(255, 255, 0, 1), rgba(0, 255, 255, 1))')
                )
              }
            >
              Centered Yellow-Cyan
            </button>
            <button onClick={() => setGradient('linear-gradient(0deg, #ff0000, #0000ff)')}>
              Reset
            </button>
          </div>
          <animate.div
            style={{
              width: 200,
              height: 100,
              background: gradient,
              borderRadius: 4,
            }}
          />
        </div>

        {/* Text Shadow */}
        <div>
          <h3 style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
            Text Shadow
          </h3>
          <div className="button-group mb">
            <button
              onClick={() =>
                setTextShadow(withSpring('2px 2px 4px rgba(0, 0, 0, 0.5)'))
              }
            >
              Simple Shadow
            </button>
            <button
              onClick={() =>
                setTextShadow(
                  withTiming('1px 1px 2px rgba(255, 0, 0, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.5)', {
                    duration: 1200,
                  })
                )
              }
            >
              Multiple Shadows
            </button>
            <button
              onClick={() =>
                setTextShadow(withSpring('0px 0px 10px rgba(0, 255, 0, 0.8)'))
              }
            >
              Green Glow
            </button>
            <button onClick={() => setTextShadow('0px 0px 0px rgba(0, 0, 0, 0)')}>
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

        {/* Filter Effects */}
        <div>
          <h3 style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
            Filter Effects
          </h3>
          <div className="button-group mb">
            <button
              onClick={() => setFilter(withSpring('blur(5px) brightness(1)'))}
            >
              Blur
            </button>
            <button
              onClick={() => setFilter(withTiming('blur(0px) brightness(1.5)', { duration: 1000 }))}
            >
              Brightness
            </button>
            <button
              onClick={() => setFilter(withSpring('blur(3px) brightness(1.2)'))}
            >
              Combined
            </button>
            <button onClick={() => setFilter('blur(0px) brightness(1)')}>
              Reset
            </button>
          </div>
          <animate.div
            style={{
              width: 100,
              height: 100,
              backgroundColor: 'teal',
              borderRadius: 4,
              filter: filter,
            }}
          />
        </div>
      </div>
    </>
  );
};

export default Example;

