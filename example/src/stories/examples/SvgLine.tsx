import { useValue, useDrag, animate, withSpring } from 'react-ui-animate';

export function SVGLine() {
  const [dragX, setDragX] = useValue(0);
  const [followX, setFollowX] = useValue(0);

  const circleBind = useDrag(({ movementX }) => {
    setDragX(movementX);
    setFollowX(withSpring(movementX));
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
          {...circleBind()}
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
