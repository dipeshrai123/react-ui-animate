import { AnimatedBlock, useAnimatedValue } from 'react-ui-animate';

/**
 * Test cases
 * 1. red -> yellow ( named colors )
 * 2. Hex colors
 * 3. number
 * 4. string + numbers ( example: 1px solid red )
 * 5. rgba colors
 * 6. rgb colors
 * 7. non interpolable values ( example: 'relative' -> 'absolute' )
 */

function App() {
  const x = useAnimatedValue('5px solid rgba(0,0,0,0.5)');

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
