import React from 'react';
import {
  useValue,
  clamp,
  animate,
  withTiming,
  withSequence,
  withSpring,
  useDrag,
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
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  const [{ left, top, width, height, translateY }, setValue] = useValue({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    translateY: 0,
  });

  const bind = useDrag(({ down, movementY }) => {
    setValue({
      translateY: down ? withSpring(clamp(movementY, 0, 300)) : withSpring(0),
    });

    if (!down && movementY > 200) {
      closeSharedElement();
    }
  });

  React.useLayoutEffect(() => {
    if (activeIndex !== null) {
      const activeBox = document.getElementById(`box-${activeIndex}`);
      const clientRect = activeBox!.getBoundingClientRect();

      setValue({
        left: withSequence([
          withTiming(clientRect.left, { duration: 0 }),
          withSpring(0),
        ]),
        top: withSequence([
          withTiming(clientRect.top, { duration: 0 }),
          withSpring(0),
        ]),
        width: withSequence([
          withTiming(clientRect.width, { duration: 0 }),
          withSpring(window.innerWidth),
        ]),
        height: withSequence([
          withTiming(clientRect.height, { duration: 0 }),
          withSpring(window.innerHeight),
        ]),
      });
    }
  }, [activeIndex, setValue]);

  const closeSharedElement = () => {
    if (activeIndex !== null) {
      const activeBox = document.getElementById(`box-${activeIndex}`);
      const clientRect = activeBox!.getBoundingClientRect();

      setValue({
        left: withSpring(clientRect.left),
        top: withSpring(clientRect.top),
        width: withSpring(clientRect.width),
        height: withSpring(clientRect.height, {
          onRest: () => setActiveIndex(null),
        }),
      });
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
                {...bind()}
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
