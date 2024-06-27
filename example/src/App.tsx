import { AnimatedBlock, useAnimatedValue } from 'react-ui-animate';

function App() {
  const x = useAnimatedValue('5px solid green');

  return (
    <div>
      <AnimatedBlock
        style={{
          width: 100,
          height: 100,
          border: x.value,
          // position: x.value,
          backgroundColor: 'yellow',
          left: 0,
          top: 0,
        }}
        onClick={() => (x.value = '10px solid red')}
      />

      <div style={{ height: 100, background: '#e1e1e1' }} />
    </div>
  );
}

export default App;
