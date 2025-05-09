import React from 'react';
import {
  useValue,
  MountedBlock,
  clamp,
  animate,
  withTiming,
  withSequence,
  withSpring,
  useDrag,
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

  const left = useValue(0);
  const top = useValue(0);
  const width = useValue(0);
  const height = useValue(0);
  const translateY = useValue(0);

  const bind = useDrag(({ down, movementY }) => {
    translateY.value = down
      ? withSpring(clamp(movementY, 0, 300))
      : withSpring(0);

    if (!down && movementY > 200) {
      closeSharedElement();
    }
  });

  React.useLayoutEffect(() => {
    if (activeIndex !== null) {
      const activeBox = document.getElementById(`box-${activeIndex}`);
      const clientRect = activeBox!.getBoundingClientRect();

      left.value = withSequence([
        withTiming(clientRect.left, { duration: 0 }),
        withSpring(0),
      ]);
      top.value = withSequence([
        withTiming(clientRect.top, { duration: 0 }),
        withSpring(0),
      ]);

      width.value = withSequence([
        withTiming(clientRect.width, { duration: 0 }),
        withSpring(window.innerWidth),
      ]);

      height.value = withSequence([
        withTiming(clientRect.height, { duration: 0 }),
        withSpring(window.innerHeight),
      ]);
    }
  }, [activeIndex, height, left, top, width]);

  const closeSharedElement = () => {
    if (activeIndex !== null) {
      const activeBox = document.getElementById(`box-${activeIndex}`);
      const clientRect = activeBox!.getBoundingClientRect();

      left.value = withSpring(clientRect.left);
      top.value = withSpring(clientRect.top);
      width.value = withSpring(clientRect.width);
      height.value = withSpring(clientRect.height, {
        onRest: () => setActiveIndex(null),
      });
    }
  };

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

      <MountedBlock state={activeIndex !== null}>
        {() => (
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
                left: left.value,
                top: top.value,
                width: width.value,
                height: height.value,
                translateY: translateY.value,
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
        )}
      </MountedBlock>
    </>
  );
}
