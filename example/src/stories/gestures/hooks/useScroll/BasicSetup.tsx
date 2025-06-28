import { useState } from 'react';
import { useScroll } from 'react-ui-animate';

const Example = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  useScroll(window, function (event) {
    console.log('Scroll', event);
    setScrollPosition(event.offset.y);
  });

  return (
    <div style={{ height: 2000 }}>
      <div style={{ position: 'fixed', left: 10, top: 10 }}>
        SCROLL POSITION: {scrollPosition}
      </div>
    </div>
  );
};

export default Example;
