import React from 'react';
import {
  useValue,
  animate,
  useGesture,
  clamp,
  withSpring,
} from 'react-ui-animate';

export const Gestures = () => {
  const x = useValue(0);
  const y = useValue(0);
  const s = useValue(1);
  const rotate = useValue(0);
  const scaleRef = React.useRef(1);
  const rotateRef = React.useRef(0);

  const bind = useGesture({
    onDrag: function ({ offsetX, offsetY }) {
      x.value = withSpring(offsetX);
      y.value = withSpring(offsetY);
    },
    onWheel: function ({ deltaY }) {
      scaleRef.current += deltaY * -0.001;
      scaleRef.current = clamp(scaleRef.current, 0.125, 4);

      s.value = withSpring(scaleRef.current);
    },
  });

  return (
    <>
      <div style={{ position: 'fixed', right: 0, bottom: 0 }}>
        <button
          onClick={() => {
            rotateRef.current -= 90;
            rotate.value = withSpring(rotateRef.current);
          }}
        >
          ROTATE LEFT
        </button>
        <button
          onClick={() => {
            rotateRef.current += 90;
            rotate.value = withSpring(rotateRef.current);
          }}
        >
          ROTATE RIGHT
        </button>
      </div>

      <div>
        <animate.div
          {...bind()}
          style={{
            width: 100,
            height: 100,
            position: 'fixed',
            left: 0,
            top: 0,
            backgroundColor: '#3399ff',
            translateX: x.value,
            translateY: y.value,
            scale: s.value,
            rotateZ: rotate.value,
            color: 'white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: 20,
          }}
        >
          DIPESH
        </animate.div>
      </div>
    </>
  );
};

// import React from "react";
// import { useSpring, animated } from "react-spring";
// import { useGesture, clamp } from "react-ui-animate";

// export const Gestures = () => {
//   const [{ x, y, s, rotate }, api] = useSpring(() => ({
//     x: 0,
//     y: 0,
//     s: 1,
//     rotate: 0,
//   }));

//   const scaleRef = React.useRef(0);
//   const rotateRef = React.useRef(0);

//   const bind = useGesture({
//     onDrag: function ({ offsetX, offsetY }) {
//       api.start({ x: offsetX, y: offsetY });
//     },
//     onWheel: function ({ deltaY }) {
//       scaleRef.current += deltaY * -0.01;
//       scaleRef.current = clamp(scaleRef.current, 0.125, 4);

//       api.start({ s: scaleRef.current });
//     },
//   });

//   return (
//     <>
//       <div style={{ position: "fixed", right: 0, bottom: 0 }}>
//         <button
//           onClick={() => {
//             rotateRef.current -= 90;
//             api.start({ rotate: rotateRef.current });
//           }}
//         >
//           ROTATE LEFT
//         </button>
//         <button
//           onClick={() => {
//             rotateRef.current += 90;
//             api.start({ rotate: rotateRef.current });
//           }}
//         >
//           ROTATE RIGHT
//         </button>
//       </div>

//       <animated.div
//         {...bind()}
//         style={{
//           width: 100,
//           height: 100,
//           position: "fixed",
//           left: 0,
//           top: 0,
//           backgroundColor: "#3399ff",
//           translateX: x,
//           translateY: y,
//           scale: s,
//           rotate: rotate,
//           color: "white",
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//           fontSize: 20,
//         }}
//       >
//         DIPESH
//       </animated.div>
//     </>
//   );
// };
