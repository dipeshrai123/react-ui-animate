import { useRef } from 'react';
import { useValue, useDrag, animate, withSpring } from 'react-ui-animate';
import { ExampleLayout } from '../animations/shared';

function Example() {
  const [dragX, setDragX] = useValue(0);
  const [followX, setFollowX] = useValue(0);
  const ref = useRef(null);

  useDrag(ref, ({ offset }) => {
    setDragX(offset.x);
    setFollowX(withSpring(offset.x));
  });

  return (
    <ExampleLayout
      title="SVG Animation"
      description="Drag the red circle to see the line and follower circle animate with spring physics. Demonstrates animate components with SVG elements."
      onRestart={() => {
        setDragX(0);
        setFollowX(0);
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
        <svg
          style={{
            border: '2px solid #3399ff',
            borderRadius: 12,
            backgroundColor: '#f0f9ff',
          }}
          width={300}
          height={200}
          xmlns="http://www.w3.org/2000/svg"
        >
          <animate.line x1={followX} y1="50" x2={dragX} y2="100" stroke="#3399ff" strokeWidth="2" />
          <animate.circle cx={followX} cy="50" r="4" fill="#51cf66" />
          <animate.circle
            ref={ref}
            style={{
              cursor: 'grab',
            }}
            cx={dragX}
            cy="100"
            r="8"
            fill="#ff6b6b"
          />
        </svg>
      </div>
    </ExampleLayout>
  );
}

export default Example;
