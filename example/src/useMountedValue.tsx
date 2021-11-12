import React from "react";
import { useMountedValue, AnimatedBlock, bInterpolate } from "react-ui-animate";

export const UseMountedValue: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const mountedValue = useMountedValue(open, {
    from: 0,
    enter: 1,
    exit: 0,
    config: {
      duration: 200,
      exitDuration: 1000,
    },
  });

  return (
    <>
      {mountedValue(
        (animation, mounted) =>
          mounted && (
            <AnimatedBlock
              style={{
                width: bInterpolate(animation.value, 100, 500),
                height: 100,
                // backgroundColor: "#3399ff",

                background: "red",
              }}
            />
          )
      )}

      <button
        onClick={() => {
          setOpen((prev) => !prev);
        }}
      >
        ANIMATE ME
      </button>
    </>
  );
};
