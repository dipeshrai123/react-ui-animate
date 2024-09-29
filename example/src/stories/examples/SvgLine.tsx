import { useValue, useDrag, animate, withTiming } from 'react-ui-animate';

export function SVGLine() {
  const dragX = useValue(0);
  const followX = useValue(0);

  const circleBind = useDrag(({ movementX }) => {
    dragX.value = withTiming(movementX, { duration: 0 });
    followX.value = movementX;
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
        <animate.line
          x1={followX.value}
          y1="10"
          x2={dragX.value}
          y2="50"
          stroke="black"
        />
        <animate.circle cx={followX.value} cy="10" r="2" fill="red" />
        <animate.circle
          {...circleBind()}
          style={{
            cursor: 'pointer',
          }}
          cx={dragX.value}
          cy="50"
          r="5"
          fill="red"
        />
      </svg>
    </div>
  );
}
