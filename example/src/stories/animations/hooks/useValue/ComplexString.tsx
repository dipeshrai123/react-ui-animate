import React from 'react';
import { animate, useValue, withSpring, withTiming } from 'react-ui-animate';

const Example: React.FC = () => {
  const [boxShadow, setBoxShadow] = useValue('0px 0px 0px rgba(0, 0, 0, 0)');
  const [border, setBorder] = useValue('2px solid rgba(100, 150, 200, 0.5)');
  const [fontSize, setFontSize] = useValue('16px');
  const [padding, setPadding] = useValue('10px 20px');
  const [transform, setTransform] = useValue('translateX(0px) rotate(0deg) scale(1)');
  const [gradient, setGradient] = useValue('linear-gradient(0deg, #ff0000, #0000ff)');

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
      </div>
    </>
  );
};

export default Example;

