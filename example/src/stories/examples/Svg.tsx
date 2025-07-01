import { useRef } from 'react';
import { useValue, useDrag, animate, withSpring } from 'react-ui-animate';

function Example() {
  const [dragX, setDragX] = useValue(0);
  const [followX, setFollowX] = useValue(0);
  const ref = useRef(null);

  useDrag(ref, ({ offset }) => {
    setDragX(offset.x);
    setFollowX(withSpring(offset.x));
  });

  return (
    <div className="App">
      <svg
        style={{
          border: '1px solid #3399ff',
        }}
        width={200}
        height={200}
        xmlns="http://www.w3.org/2000/svg"
      >
        <animate.line x1={followX} y1="10" x2={dragX} y2="50" stroke="black" />
        <animate.circle cx={followX} cy="10" r="2" fill="red" />
        <animate.circle
          ref={ref}
          style={{
            cursor: 'pointer',
          }}
          cx={dragX}
          cy="50"
          r="5"
          fill="red"
        />
      </svg>
    </div>
  );
}

export default Example;
