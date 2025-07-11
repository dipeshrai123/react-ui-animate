import { useEffect, useRef } from 'react';
import { useScroll, animate } from 'react-ui-animate';

/**
 * Draws one red absolute line on your element (“box”) and one black fixed line in the viewport (“container”)
 * for each intersection string of the form "<boxToken> <viewportToken>".
 *
 * Accepted tokens for both boxToken and viewportToken:
 *  • Numbers    – raw fraction (0 → start, 1 → end; values outside range allowed)
 *  • Names      – "start" (0), "center" (0.5), "end" (1)
 *  • Pixels     – e.g. "100px", "-50px"
 *  • Percent    – "0%"… "100%" (maps to 0…1 fraction)
 *  • Viewport   – "vh" and "vw" units (e.g. "10vh", "5vw")
 *
 * @param target        Any HTMLElement or React ref pointing to one
 * @param intersections Array of strings: "<boxToken> <viewportToken>"
 */
function markBordersAndLines(target: any, intersections: any[]): void {
  const el: HTMLElement | null = target?.current ?? target;
  if (!(el instanceof HTMLElement)) {
    console.error('markBordersAndLines: invalid target', target);
    return;
  }

  const rect = el.getBoundingClientRect();
  const scrollY = window.pageYOffset || document.documentElement.scrollTop;
  const vpH = window.innerHeight;
  const vpW = window.innerWidth;

  // Draw a red absolute line at document-Y = y
  function drawAbsoluteLine(y: number) {
    const line = document.createElement('div');
    Object.assign(line.style, {
      position: 'absolute',
      top: `${y}px`,
      left: '0',
      width: '100%',
      borderTop: '1px dashed red',
      zIndex: '9999',
      pointerEvents: 'none',
    });
    document.body.appendChild(line);
  }

  // Draw a black fixed line at viewport-Y = pos
  function drawFixedLine(pos: number) {
    const line = document.createElement('div');
    Object.assign(line.style, {
      position: 'fixed',
      top: `${pos}px`,
      left: '0',
      width: '100%',
      borderTop: '1px solid black',
      zIndex: '9999',
      pointerEvents: 'none',
    });
    document.body.appendChild(line);
  }

  // Parse a token into a px-offset along a vertical axis of length axisLen
  function parseOffset(token: string, axisLen: number): number {
    const t = token.trim();
    // Named shortcuts
    if (t === 'start') return 0;
    if (t === 'center') return axisLen / 2;
    if (t === 'end') return axisLen;

    const m = /^(-?\d+(?:\.\d+)?)(px|vh|vw|%)?$/.exec(t);
    if (!m) {
      console.error('markBordersAndLines: invalid token', token);
      return 0;
    }
    const val = parseFloat(m[1]);
    const unit = m[2];

    if (!unit) {
      // raw fraction
      return axisLen * val;
    }
    switch (unit) {
      case 'px':
        return val;
      case '%':
        return axisLen * (val / 100);
      case 'vh':
        return vpH * (val / 100);
      case 'vw':
        return vpW * (val / 100);
      default:
        return 0;
    }
  }

  intersections.forEach((str) => {
    if (typeof str !== 'string' || !str.includes(' ')) {
      console.error('markBordersAndLines: expected "<box> <viewport>"', str);
      return;
    }
    const [boxTok, vpTok] = str.trim().split(/\s+/);

    // Box line (red, absolute)
    const boxOffset = parseOffset(boxTok, rect.height);
    const y = scrollY + rect.top + boxOffset;
    drawAbsoluteLine(y);

    // Viewport line (black, fixed)
    const vpOffset = parseOffset(vpTok, vpH);
    drawFixedLine(vpOffset);
  });
}

export default function IntersectionExample() {
  const boxRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll(window, {
    target: boxRef,
    offset: ['0 0.9', '1 0.5'],
  });

  useEffect(() => {
    markBordersAndLines(boxRef, ['0 0.9', '1 0.5']);
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
          top: 'calc(50vh - 150px)',
          opacity: scrollYProgress,
          // scale: scrollYProgress.to([0, 1], [1, 2]),
          // rotate: scrollYProgress.to([0, 1], [0, 360]),
        }}
      />
    </div>
  );
}
