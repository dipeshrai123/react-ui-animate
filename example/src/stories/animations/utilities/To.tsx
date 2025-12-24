import React, { useState, useEffect } from 'react';
import { animate, useValue } from 'react-ui-animate';

const Example: React.FC = () => {
  const [trigger, setTrigger] = useState(0);
  const [scrollValue, setScrollValue] = useState(0);
  const [scroll, setScroll] = useValue(0);

  useEffect(() => {
    setScroll(scrollValue);
  }, [scrollValue, setScroll]);

  // Interpolate scroll value to different ranges
  const opacity = scroll.to([0, 100], [0, 1]);
  const scale = scroll.to([0, 100], [0.5, 1.5]);
  const color = scroll.to([0, 100], ['#3399ff', '#ff6b6b']);

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 30 }}>to Interpolation Utility</h1>
      <p style={{ marginBottom: 40, color: '#666' }}>
        Interpolate values from one range to another
      </p>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>Basic Interpolation</h2>
        <div style={{ marginBottom: 20 }}>
          <input
            type="range"
            min="0"
            max="100"
            value={scrollValue}
            onChange={(e) => setScrollValue(Number(e.target.value))}
            style={{ width: 300 }}
          />
          <p style={{ marginTop: 10, fontSize: 14 }}>
            Input: {scroll.current} | Opacity: {opacity.current} | Scale:{' '}
            {scale.current}
          </p>
        </div>
        <animate.div
          style={{
            width: 100,
            height: 100,
            backgroundColor: color,
            borderRadius: 8,
            opacity: opacity,
            scale: scale,
          }}
        />
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>Color Interpolation</h2>
        <div style={{ marginBottom: 20 }}>
          <input
            type="range"
            min="0"
            max="100"
            value={scrollValue}
            onChange={(e) => setScrollValue(Number(e.target.value))}
            style={{ width: 300 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          <animate.div
            style={{
              width: 100,
              height: 100,
              backgroundColor: scroll.to([0, 100], ['#3399ff', '#ff6b6b']),
              borderRadius: 8,
            }}
          />
          <animate.div
            style={{
              width: 100,
              height: 100,
              backgroundColor: scroll.to([0, 100], ['#51cf66', '#ffd43b']),
              borderRadius: 8,
            }}
          />
          <animate.div
            style={{
              width: 100,
              height: 100,
              backgroundColor: scroll.to([0, 100], ['#845ef7', '#20c997']),
              borderRadius: 8,
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ marginBottom: 20 }}>Transform Interpolation</h2>
        <div style={{ marginBottom: 20 }}>
          <input
            type="range"
            min="0"
            max="100"
            value={scrollValue}
            onChange={(e) => setScrollValue(Number(e.target.value))}
            style={{ width: 300 }}
          />
        </div>
        <animate.div
          style={{
            width: 100,
            height: 100,
            backgroundColor: '#3399ff',
            borderRadius: 8,
            translateX: scroll.to([0, 100], [0, 300]),
            rotate: scroll.to([0, 100], [0, 360]),
          }}
        />
      </div>

      <div style={{ marginTop: 40 }}>
        <button
          onClick={() => {
            setScroll(0);
            setTrigger((prev) => prev + 1);
          }}
          style={{
            padding: '12px 24px',
            fontSize: 16,
            backgroundColor: '#3399ff',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default Example;
