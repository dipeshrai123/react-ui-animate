import { AnimatedBlock, useAnimatedValue } from "react-ui-animate";

export default function App() {
  const translateX = useAnimatedValue(0);

  return (
    <div>
      <button onClick={() => (translateX.value = Math.random() * 500)}>
        Click Me
      </button>
      <AnimatedBlock
        style={{
          width: 100,
          height: 100,
          backgroundColor: "red",
          translateX: translateX.value,
        }}
      />
    </div>
  );
}
