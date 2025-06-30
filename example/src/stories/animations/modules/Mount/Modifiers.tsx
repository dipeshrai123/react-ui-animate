import React from 'react';
import {
  animate,
  AnimationConfig,
  useMount,
  withSpring,
} from 'react-ui-animate';

const Example: React.FC = () => {
  const [open, setOpen] = React.useState(true);
  const mounted = useMount(open, {
    enter: withSpring(1, AnimationConfig.Spring.WOBBLE),
  });

  return (
    <>
      {mounted(
        (a, m) =>
          m && (
            <animate.div
              style={{
                width: 100,
                height: 100,
                backgroundColor: 'teal',
                opacity: a,
                borderRadius: 4,
                translateX: a.to([0, 1], [0, 200]),
              }}
            />
          )
      )}

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
