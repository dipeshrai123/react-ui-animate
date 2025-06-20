import React, { useRef } from 'react';
import {
  clamp,
  animate,
  useDrag,
  useValue,
  withTiming,
  withSpring,
  withSequence,
  useMount,
} from 'react-ui-animate';

const BOX_SIZE = 200;

const IMAGES = [
  'https://images.unsplash.com/photo-1502082553048-f009c37129b9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
  'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
  'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
  'https://images.unsplash.com/photo-1444464666168-49d633b86797?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1469&q=80',
];

export function SharedElement() {
  const ref = useRef(null);
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  const [{ left, top, width, height, translateY }, setValue] = useValue({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    translateY: 0,
  });

  useDrag(ref, ({ down, movement }) => {
    setValue(
      withSpring({
        translateY: down ? clamp(movement.y, 0, 300) : 0,
      })
    );

    if (movement.y > 200 && !down) {
      closeSharedElement();
    }
  });

  React.useLayoutEffect(() => {
    if (activeIndex !== null) {
      const box = document.getElementById(`box-${activeIndex}`)!;
      const { left, top, width, height } = box.getBoundingClientRect();

      setValue(
        withSequence([
          withTiming({ left, top, width, height }, { duration: 0 }),
          withSpring(
            {
              left: 0,
              top: 0,
              width: window.innerWidth,
              height: window.innerHeight,
            },
            {
              damping: 14,
            }
          ),
        ])
      );
    }
  }, [activeIndex, setValue]);

  const closeSharedElement = () => {
    if (activeIndex !== null) {
      const activeBox = document.getElementById(`box-${activeIndex}`);
      const clientRect = activeBox!.getBoundingClientRect();

      setValue(
        withSpring(
          {
            left: clientRect.left,
            top: clientRect.top,
            width: clientRect.width,
            height: clientRect.height,
            translateY: 0,
          },
          {
            onComplete: () => setActiveIndex(null),
            damping: 14,
          }
        )
      );
    }
  };

  const mount = useMount(activeIndex !== null);

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          gridGap: '20px',
        }}
      >
        {IMAGES.map((image, index) => {
          const imageStyle =
            activeIndex === index
              ? {
                  backgroundColor: 'white',
                }
              : {
                  backgroundImage: `url(${image})`,
                  backgroundSize: 'cover',
                };

          return (
            <div
              id={`box-${index}`}
              key={index}
              style={{
                height: BOX_SIZE,
                backgroundColor: '#e1e1e1',
                cursor: 'pointer',
                ...imageStyle,
              }}
              onClick={() => setActiveIndex(index)}
            />
          );
        })}
      </div>

      {mount(
        (_, m) =>
          m && (
            <animate.div
              style={{
                position: 'fixed',
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'none',
              }}
            >
              <animate.div
                ref={ref}
                style={{
                  position: 'absolute',
                  left,
                  top,
                  width,
                  height,
                  translateY,
                  color: 'white',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'grabbing',
                  backgroundImage: `url(${IMAGES[activeIndex!]})`,
                  backgroundSize: 'cover',
                }}
              >
                <span style={{ userSelect: 'none' }}>Pull Down</span>
              </animate.div>
            </animate.div>
          )
      )}
    </>
  );
}
