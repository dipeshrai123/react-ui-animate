import { useEffect, useRef } from 'react';
import { useScroll, animate } from 'react-ui-animate';

function markBordersAndLines(target: any, offsets: any) {
  // resolve ref or element
  const el = target?.current || target;
  if (!(el instanceof HTMLElement)) {
    console.error('markBordersAndLines: invalid target');
    return;
  }

  // helpers
  function drawAbsoluteLine(y: any, color: any) {
    const line = document.createElement('div');
    Object.assign(line.style, {
      position: 'absolute',
      top: `${y}px`,
      left: '0',
      width: '100%',
      borderTop: `1px solid ${color}`,
      zIndex: '9999',
      pointerEvents: 'none',
    });
    document.body.appendChild(line);
  }

  function drawFixedLine(y: any, color: any) {
    const line = document.createElement('div');
    Object.assign(line.style, {
      position: 'fixed',
      top: `${y}px`,
      left: '0',
      width: '100%',
      borderTop: `1px solid ${color}`,
      zIndex: '9999',
      pointerEvents: 'none',
    });
    document.body.appendChild(line);
  }

  // get element’s current viewport rect once
  const rect = el.getBoundingClientRect();

  offsets.forEach((entry: any) => {
    // split into ["start","400px"] or ["end","200px"]
    const [posToken, pxToken] = entry.split(/\s+/);
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    // black line at element edge
    if (posToken === 'start') {
      drawAbsoluteLine(scrollY + rect.top, 'black');
    } else if (posToken === 'end') {
      drawAbsoluteLine(scrollY + rect.bottom, 'black');
    }

    // red fixed line at viewport offset
    if (/^\d+px$/.test(pxToken)) {
      const y = parseInt(pxToken, 10);
      drawFixedLine(y, 'red');
    }
  });
}

export default function IntersectionExample() {
  const boxRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll(window, {
    target: boxRef,
    offset: ['start center', 'end center'],
  });

  useEffect(() => {
    markBordersAndLines(boxRef, ['start center', 'end center']);
  }, []);

  return (
    <div style={{ height: '200vh', paddingTop: '100vh' }}>
      <animate.div
        ref={boxRef}
        style={{
          width: 150,
          height: 150,
          margin: '0 auto',
          background: 'teal',
          borderRadius: 8,
          position: 'sticky',
          top: 0,
          opacity: scrollYProgress,
          // scale: scrollYProgress.to([0, 1], [1, 2]),
          // rotate: scrollYProgress.to([0, 1], [0, 360]),
        }}
      />
    </div>
  );
}
