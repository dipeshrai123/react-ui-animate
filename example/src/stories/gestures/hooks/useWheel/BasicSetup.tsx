import { useState } from 'react';
import { useWheel } from 'react-ui-animate';

const Example = () => {
  const [wheelPosition, setWheelPosition] = useState({ x: 0, y: 0 });

  useWheel(window, function (event) {
    console.log('Wheel event:', event);
    setWheelPosition({ x: event.offset.x, y: event.offset.y });
  });

  return (
    <div style={{ height: 2000 }}>
      <div style={{ position: 'fixed', left: 10, top: 10 }}>
        WHEEL POSITION: {wheelPosition.x}, {wheelPosition.y}
      </div>
    </div>
  );
};

export default Example;
