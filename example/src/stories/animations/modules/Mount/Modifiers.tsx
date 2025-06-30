import React from 'react';
import { animate, AnimationConfig, withSpring, Mount } from 'react-ui-animate';

const Example: React.FC = () => {
  const [open, setOpen] = React.useState(true);

  return (
    <>
      <Mount state={open} enter={withSpring(1, AnimationConfig.Spring.WOBBLE)}>
        {(animation) => (
          <animate.div
            style={{
              width: 100,
              height: 100,
              backgroundColor: 'teal',
              opacity: animation,
              borderRadius: 4,
              translateX: animation.to([0, 1], [0, 200]),
            }}
          />
        )}
      </Mount>

      <button
        className="mt"
        onClick={() => {
          setOpen((prev) => !prev);
        }}
      >
        ANIMATE ME
      </button>
    </>
  );
};

export default Example;
