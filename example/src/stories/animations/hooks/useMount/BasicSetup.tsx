import React from 'react';
import { animate, useMount } from 'react-ui-animate';

const Example: React.FC = () => {
  const [open, setOpen] = React.useState(true);
  const mounted = useMount(open);

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
