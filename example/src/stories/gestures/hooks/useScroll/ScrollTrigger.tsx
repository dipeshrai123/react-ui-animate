import { useEffect, useRef } from 'react';
import { useScroll, animate } from 'react-ui-animate';

export default function IntersectionExample() {
  const boxRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll(window, {
    target: boxRef,
    offset: ['start 80vh', 'end 200px'],
  });

  useEffect(() => {
    markBordersAndLines(boxRef, ['start 80vh', 'end 200px']);
  }, []);

  return (
    <div>
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
          }}
        />
      </div>
      <div style={{ height: '100vh' }} />
    </div>
  );
}

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

  function parseOffset(token: string, axisLen: number): number {
    const t = token.trim();
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

    const boxOffset = parseOffset(boxTok, rect.height);
    const y = scrollY + rect.top + boxOffset;
    drawAbsoluteLine(y);

    const vpOffset = parseOffset(vpTok, vpH);
    drawFixedLine(vpOffset);
  });
}
