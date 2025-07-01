import React from 'react';
import { animate, useValue, withSpring, withTiming } from 'react-ui-animate';

const Example: React.FC = () => {
  const [bg, setBg] = useValue('teal');

  return (
    <>
      <div className="button-group mb">
        <button onClick={() => setBg(withSpring('blue'))}>
          Spring to Blue
        </button>
        <button onClick={() => setBg(withSpring('purple'))}>
          Spring to Purple
        </button>
        <button onClick={() => setBg(withTiming('red', { duration: 2000 }))}>
          Timing Red
        </button>
        <button onClick={() => setBg('teal')}>Immediate to Teal</button>
      </div>

      <animate.div
        style={{
          width: 100,
          height: 100,
          backgroundColor: bg,
          left: 0,
          top: 0,
          borderRadius: 4,
        }}
      />
    </>
  );
};

export default Example;
