import {
  useAnimatedValue,
  makeAnimatedComponent,
  useDrag,
} from "react-ui-animate";

const AnimatedLine = makeAnimatedComponent("line");
const AnimatedCircle = makeAnimatedComponent("circle");

export function SVGLine() {
  const dragX = useAnimatedValue(0, { immediate: true });
  const followX = useAnimatedValue(0, { animationType: "elastic" });

  const circleBind = useDrag(({ movementX }) => {
    dragX.value = movementX;
    followX.value = movementX;
  });

  return (
    <div className="App">
      <svg
        style={{
          border: "1px solid #3399ff",
        }}
        width={200}
        height={200}
        xmlns="http://www.w3.org/2000/svg"
      >
        <AnimatedLine
          x1={followX.value}
          y1="10"
          x2={dragX.value}
          y2="50"
          stroke="black"
        />
        <AnimatedCircle cx={followX.value} cy="10" r="2" fill="red" />
        <AnimatedCircle
          {...circleBind()}
          style={{
            cursor: "pointer",
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
