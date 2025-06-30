import React from 'react';
import { animate, Mount } from 'react-ui-animate';

const Example: React.FC = () => {
  const [open, setOpen] = React.useState(true);

  return (
    <>
      <Mount state={open}>
        {(a) => (
          <animate.div
            style={{
              width: 100,
              height: 100,
              backgroundColor: 'teal',
              opacity: a,
              borderRadius: 4,
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
