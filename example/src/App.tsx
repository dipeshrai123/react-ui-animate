import { AnimatedBlock, useAnimatedValue } from 'react-ui-animate';

function App() {
  const x = useAnimatedValue(0);

  return (
    <div>
      <AnimatedBlock
        style={{
          width: 100,
          height: 100,
          backgroundColor: 'red',
          position: 'relative',
          left: x.value,
          top: 0,
        }}
        onClick={() => (x.value = 500)}
      />
    </div>
  );
}

export default App;
