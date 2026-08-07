import { withSpring, withTiming, animate } from 'react-ui-animate';
import { ExampleLayout } from '../shared';

// Scroll target uses different drivers for enter vs. exit so the fix is
// obvious: `withTiming` in, `withTiming` out (not always spring).
function TimingBox() {
  return (
    <animate.div
      style={{
        width: 220,
        height: 120,
        borderRadius: 16,
        backgroundColor: '#3399ff',
        boxShadow: '0 4px 12px rgba(51, 153, 255, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 600,
        fontSize: 15,
        textAlign: 'center',
        padding: 16,
        opacity: 0,
        translateY: 60,
      }}
      view={{
        opacity: withTiming(1, { duration: 500 }),
        translateY: withTiming(0, { duration: 500 }),
      }}
      viewOptions={{ threshold: 0.5, once: false }}
    >
      withTiming in, withTiming out
    </animate.div>
  );
}

// Same idea with a spring, using very deliberate stiffness/damping so the
// exit visibly reuses those options instead of a default spring.
function SpringBox() {
  return (
    <animate.div
      style={{
        width: 220,
        height: 120,
        borderRadius: 16,
        backgroundColor: '#ff6b6b',
        boxShadow: '0 4px 12px rgba(255, 107, 107, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 600,
        fontSize: 15,
        textAlign: 'center',
        padding: 16,
        opacity: 0,
        scale: 0.5,
      }}
      view={{
        opacity: withTiming(1, { duration: 300 }),
        scale: withSpring(1, { stiffness: 500, damping: 8 }),
      }}
      viewOptions={{ threshold: 0.5, once: false }}
    >
      withSpring({'{'} stiffness: 500, damping: 8 {'}'}) in and out
    </animate.div>
  );
}

function Example() {
  return (
    <ExampleLayout
      title="Repeating View Animations"
      description="With viewOptions.once=false, each box animates in and out every time it crosses the viewport. Scroll the panel below up and down: the driver you configured (withTiming or a bouncy withSpring) now runs on the way out too, instead of always reverting with a default spring."
      showRestartButton={false}
    >
      <div
        style={{
          height: 420,
          overflowY: 'auto',
          border: '2px solid #e0e0e0',
          borderRadius: 12,
          backgroundColor: '#fafafa',
        }}
      >
        <div style={{ height: 200 }} />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 400,
            padding: '0 24px',
          }}
        >
          <TimingBox />
          <SpringBox />
        </div>
        <div style={{ height: 400 }} />
      </div>
    </ExampleLayout>
  );
}

export default Example;
