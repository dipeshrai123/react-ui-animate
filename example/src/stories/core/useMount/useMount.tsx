import React from 'react';
import { animate, useMount } from 'react-ui-animate';

export const UseMount: React.FC = () => {
  const [open, setOpen] = React.useState(true);
  const mountedValue = useMount(open);

  return (
    <>
      <button
        onClick={() => {
          setOpen((prev) => !prev);
        }}
      >
        ANIMATE ME
      </button>

      {mountedValue((animation, mounted) => {
        return (
          mounted && (
            <animate.div
              style={{
                width: 100,
                height: 100,
                backgroundColor: 'teal',
                opacity: animation.value,
              }}
            />
          )
        );
      })}

      {mountedValue(
        (animation, mounted) =>
          mounted && (
            <>
              <animate.div
                style={{
                  width: animation.value.to([0, 1], [100, 300]),
                  height: animation.value.to([0, 1], [100, 200]),
                  backgroundColor: animation.value.to(
                    [0, 1],
                    ['red', '#3399ff']
                  ),
                  translateX: 45,
                }}
              />
              <animate.div
                style={{
                  width: animation.value.to([0, 1], [100, 400]),
                  height: animation.value.to([0, 1], [100, 50]),
                  border: '1px solid black',
                  backgroundColor: animation.value.to(
                    [0, 1],
                    ['red', '#3399ff']
                  ),
                  translateX: 45,
                }}
              />
              <animate.div
                style={{
                  width: animation.value.to([0, 1], [100, 500]),
                  height: 100,
                  backgroundColor: animation.value.to(
                    [0, 1],
                    ['red', '#3399ff']
                  ),
                  translateX: 45,
                }}
              />
            </>
          )
      )}
    </>
  );
};
