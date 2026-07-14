import { useEffect, useRef } from 'react';
import {
  animate,
  Easing,
  Gesture,
  useGesture,
  useValue,
  withSpring,
  withTiming,
} from 'react-ui-animate';

const DEFAULT_WIDTH = 46;
const DEFAULT_HEIGHT = 26;
const MAGNETIC_PADDING = 14;
const SPIN_DURATION = 4000;
const ATTACH_SPRING = { stiffness: 350, damping: 30 };
const FOLLOW_SPRING = { stiffness: 400, damping: 32 };

const CORNER_SIZE = 12;
const CORNER_THICKNESS = 2;

const cornerBase: React.CSSProperties = {
  position: 'absolute',
  width: CORNER_SIZE,
  height: CORNER_SIZE,
  pointerEvents: 'none',
  mixBlendMode: 'difference',
};

const corners: { style: React.CSSProperties }[] = [
  {
    style: {
      top: 0,
      left: 0,
      borderTop: `${CORNER_THICKNESS}px solid #fff`,
      borderLeft: `${CORNER_THICKNESS}px solid #fff`,
      borderTopLeftRadius: 3,
    },
  },
  {
    style: {
      top: 0,
      right: 0,
      borderTop: `${CORNER_THICKNESS}px solid #fff`,
      borderRight: `${CORNER_THICKNESS}px solid #fff`,
      borderTopRightRadius: 3,
    },
  },
  {
    style: {
      bottom: 0,
      left: 0,
      borderBottom: `${CORNER_THICKNESS}px solid #fff`,
      borderLeft: `${CORNER_THICKNESS}px solid #fff`,
      borderBottomLeftRadius: 3,
    },
  },
  {
    style: {
      bottom: 0,
      right: 0,
      borderBottom: `${CORNER_THICKNESS}px solid #fff`,
      borderRight: `${CORNER_THICKNESS}px solid #fff`,
      borderBottomRightRadius: 3,
    },
  },
];

const Example = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [left, setLeft] = useValue(0);
  const [top, setTop] = useValue(0);
  const [width, setWidth] = useValue(DEFAULT_WIDTH);
  const [height, setHeight] = useValue(DEFAULT_HEIGHT);
  const [rotation, setRotation] = useValue(0);
  const attachedRef = useRef(false);
  // The angle the cursor last came to rest at (always a multiple of 360) —
  // lets a resumed spin continue smoothly, and lets an attach-snap target
  // the *nearest* full turn instead of a fixed absolute 0, which would
  // otherwise unwind however many turns had accumulated since mount.
  const restAngleRef = useRef(0);

  const spin = () => {
    const next = restAngleRef.current + 360;
    setRotation(
      withTiming(next, {
        duration: SPIN_DURATION,
        easing: Easing.linear,
        onComplete: () => {
          restAngleRef.current = next;
          if (!attachedRef.current) spin();
        },
      })
    );
  };

  useEffect(() => {
    spin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useGesture(
    containerRef,
    Gesture.Move().onChange(({ offset, event }) => {
      const container = containerRef.current;
      if (!container) return;

      // Real hit-testing target under the pointer — the cursor overlay itself
      // is pointer-events:none, so this always resolves to whatever's beneath it.
      const magneticTarget = (event.target as HTMLElement | null)?.closest<HTMLElement>(
        '[data-magnetic]'
      );

      if (magneticTarget) {
        const containerRect = container.getBoundingClientRect();
        const targetRect = magneticTarget.getBoundingClientRect();

        setLeft(withSpring(targetRect.left - containerRect.left - MAGNETIC_PADDING, ATTACH_SPRING));
        setTop(withSpring(targetRect.top - containerRect.top - MAGNETIC_PADDING, ATTACH_SPRING));
        setWidth(withSpring(targetRect.width + MAGNETIC_PADDING * 2, ATTACH_SPRING));
        setHeight(withSpring(targetRect.height + MAGNETIC_PADDING * 2, ATTACH_SPRING));

        if (!attachedRef.current) {
          attachedRef.current = true;
          const nearestUpright = Math.round(rotation.current / 360) * 360;
          restAngleRef.current = nearestUpright;
          setRotation(withSpring(nearestUpright, ATTACH_SPRING));
        }
      } else {
        setLeft(withSpring(offset.x - DEFAULT_WIDTH / 2, FOLLOW_SPRING));
        setTop(withSpring(offset.y - DEFAULT_HEIGHT / 2, FOLLOW_SPRING));
        setWidth(withSpring(DEFAULT_WIDTH, FOLLOW_SPRING));
        setHeight(withSpring(DEFAULT_HEIGHT, FOLLOW_SPRING));

        if (attachedRef.current) {
          attachedRef.current = false;
          spin();
        }
      }
    })
  );

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100vh',
        backgroundColor: '#0a0a0a',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'none',
      }}
    >
      <animate.div
        style={{
          position: 'absolute',
          left,
          top,
          width,
          height,
          rotate: rotation,
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        {corners.map((corner, i) => (
          <div key={i} style={{ ...cornerBase, ...corner.style }} />
        ))}
      </animate.div>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 40,
          color: 'white',
          textAlign: 'center',
        }}
      >
        <div>
          <h1 style={{ fontSize: 42, margin: 0, fontWeight: 700 }}>Magnetic Cursor</h1>
          <p style={{ fontSize: 16, color: '#999', marginTop: 12 }}>
            Move around the canvas — the cursor is a spinning rectangle by
            default. Hover a link or button below to see it stop rotating
            and attach to it instead.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['Home', 'Projects', 'About'].map((item) => (
            <a
              key={item}
              href="#"
              data-magnetic={item}
              onClick={(e) => e.preventDefault()}
              style={{
                padding: '14px 28px',
                borderRadius: 10,
                border: '1px solid #333',
                color: 'white',
                textDecoration: 'none',
                fontSize: 15,
              }}
            >
              {item}
            </a>
          ))}
          <button
            data-magnetic="Contact"
            style={{
              padding: '14px 32px',
              borderRadius: 10,
              border: 'none',
              backgroundColor: '#6366f1',
              color: 'white',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Get in Touch
          </button>
        </div>
      </div>
    </div>
  );
};

export default Example;
