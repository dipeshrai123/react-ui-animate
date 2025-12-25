# React UI Animate

[![npm version](https://badge.fury.io/js/react-ui-animate.svg)](https://badge.fury.io/js/react-ui-animate)

> Create smooth animations and interactive gestures in React applications effortlessly.

## Installation

```sh
npm install react-ui-animate
```

```sh
yarn add react-ui-animate
```

---

## Quick Start

The `react-ui-animate` library provides a declarative way to add animations and gestures to your React components. Here's a simple example:

```tsx
import { animate, withSpring } from 'react-ui-animate';

function App() {
  return (
    <animate.div
      style={{
        width: 100,
        height: 100,
        backgroundColor: 'blue',
        scale: 0.5,
        opacity: 0,
      }}
      animate={{
        scale: withSpring(1),
        opacity: withSpring(1),
      }}
    />
  );
}
```

---

## Core Concepts

### 1. Animate Component

The `animate` object provides animated versions of all HTML elements. Use `animate.div`, `animate.button`, `animate.span`, etc., just like regular React elements.

#### Basic Animation

Use the `animate` prop to define animations that run when the component mounts or when the prop changes:

```tsx
import { animate, withSpring, withTiming } from 'react-ui-animate';

<animate.div
  style={{
    width: 100,
    height: 100,
    backgroundColor: 'red',
    translateX: 0,
  }}
  animate={{
    translateX: withSpring(200),
    backgroundColor: withTiming('blue', { duration: 500 }),
  }}
/>
```

#### Exit Animations with Presence

Wrap components in `Presence` to enable exit animations when they're removed:

```tsx
import { Presence, animate, withSpring, withTiming } from 'react-ui-animate';

function Modal({ isOpen, onClose }) {
  return (
    <Presence>
      {isOpen && (
        <animate.div
          key="modal"
          style={{
            opacity: 0,
            scale: 0.8,
          }}
          animate={{
            opacity: withTiming(1),
            scale: withSpring(1),
          }}
          exit={{
            opacity: withTiming(0),
            scale: withSpring(0.8),
          }}
        >
          Modal Content
        </animate.div>
      )}
    </Presence>
  );
}
```

#### State-Based Animations

React to user interactions with `hover`, `press`, `focus`, and `view` props:

```tsx
<animate.button
  style={{
    scale: 1,
    backgroundColor: '#3399ff',
  }}
  hover={{
    scale: withSpring(1.05),
    backgroundColor: withTiming('#4da6ff'),
  }}
  press={{
    scale: withSpring(0.95),
  }}
>
  Hover Me
</animate.button>
```

**View Animations** - Animate when elements enter the viewport:

```tsx
<animate.div
  style={{
    opacity: 0,
    translateY: 50,
  }}
  view={{
    opacity: withTiming(1),
    translateY: withSpring(0),
  }}
  viewOptions={{ threshold: 0.3, once: true }}
>
  This animates when scrolled into view
</animate.div>
```

### 2. useValue Hook

Create and control animated values programmatically:

```tsx
import { useValue, animate, withSpring, withSequence, withTiming } from 'react-ui-animate';

function AnimatedBox() {
  const [width, setWidth] = useValue(100);
  const [x, setX] = useValue(0);

  return (
    <>
      <button onClick={() => setWidth(withSpring(200))}>
        Expand
      </button>
      <button onClick={() => setX(withSequence([
        withTiming(100, { duration: 300 }),
        withTiming(200, { duration: 300 }),
        withTiming(0, { duration: 300 }),
      ]))}>
        Sequence
      </button>

      <animate.div
        style={{
          width,
          height: 100,
          backgroundColor: 'red',
          translateX: x,
        }}
      />
    </>
  );
}
```

**Interpolation** - Map values to different ranges:

```tsx
const [progress, setProgress] = useValue(0);

<animate.div
  style={{
    backgroundColor: progress.to([0, 1], ['red', 'blue']),
    translateX: progress.to([0, 1], [0, 500]),
  }}
/>
```

**Controls** - Control animations programmatically:

```tsx
const [value, setValue, controls] = useValue(0);

// Start animation
setValue(withSpring(100));

// Control playback
controls.pause();
controls.resume();
controls.cancel();
controls.reset();
```

### 3. Animation Descriptors

Animation descriptors define how animations behave. They can be used with both `animate` components and `useValue`.

#### withSpring

Creates physics-based spring animations:

```tsx
withSpring(100, {
  stiffness: 100,  // Spring stiffness (default: 100)
  damping: 15,    // Spring damping (default: 15)
  mass: 1,        // Spring mass (default: 1)
})
```

#### withTiming

Creates time-based animations with easing:

```tsx
withTiming(100, {
  duration: 500,           // Duration in milliseconds
  easing: Easing.easeInOut, // Easing function
})
```

#### withDecay

Creates momentum-based decay animations:

```tsx
withDecay({
  velocity: 100,  // Initial velocity
  clamp: [0, 500], // Optional: clamp values
})
```

#### withSequence

Runs animations one after another:

```tsx
withSequence([
  withTiming(100, { duration: 300 }),
  withTiming(200, { duration: 300 }),
  withSpring(0, { stiffness: 200 }),
])
```

#### withLoop

Repeats animations:

```tsx
withLoop(
  withSequence([
    withTiming(90, { duration: 500 }),
    withTiming(180, { duration: 500 }),
    withTiming(360, { duration: 500 }),
  ]),
  3  // Number of iterations (0 = infinite)
)
```

#### withDelay

Adds delay to animations (typically used inside `withSequence`):

```tsx
withSequence([
  withDelay(500),
  withTiming(1, { duration: 500 }),
])
```

### 4. Animation Recipes

Pre-built animation recipes for common use cases:

```tsx
import {
  animate,
  fadeIn,
  slideInUp,
  scaleIn,
  bounceIn,
  hoverScale,
  pressScale,
} from 'react-ui-animate';

// Enter animations
<animate.div animate={fadeIn}>Fades in</animate.div>
<animate.div animate={slideInUp}>Slides up</animate.div>
<animate.div animate={scaleIn}>Scales in</animate.div>
<animate.div animate={bounceIn}>Bounces in</animate.div>

// State animations
<animate.button hover={hoverScale} press={pressScale}>
  Interactive Button
</animate.button>

// Exit animations
<animate.div exit={exitFade}>Fades out</animate.div>
```

**Available Recipes:**

- **Fade**: `fadeIn`, `fadeOut`, `fadeInUp`, `fadeInDown`, `fadeInLeft`, `fadeInRight`
- **Slide**: `slideInUp`, `slideInDown`, `slideInLeft`, `slideInRight`, `slideOutUp`, `slideOutDown`, `slideOutLeft`, `slideOutRight`
- **Scale**: `scaleIn`, `scaleOut`, `scaleUp`, `scaleDown`
- **Bounce**: `bounceIn`, `bounceOut`
- **Rotate**: `rotateIn`, `rotateOut`, `spin`
- **Zoom**: `zoomIn`, `zoomOut`
- **Flip**: `flipX`, `flipY`
- **Combined**: `slideFadeIn`, `slideFadeOut`, `scaleFadeIn`, `scaleFadeOut`
- **Hover**: `hoverScale`, `hoverLift`, `hoverGlow`
- **Press**: `pressScale`, `pressDown`
- **Exit**: `exitFade`, `exitSlideUp`, `exitSlideDown`, `exitScale`

### 5. Presence Component

`Presence` manages mount and unmount animations for components:

```tsx
import { Presence, animate, withSpring } from 'react-ui-animate';

function List() {
  const [items, setItems] = useState(['Item 1', 'Item 2']);

  return (
    <Presence mode="sync" onExitComplete={() => console.log('All exited')}>
      {items.map((item) => (
        <animate.div
          key={item}
          animate={{ opacity: withSpring(1) }}
          exit={{ opacity: withSpring(0) }}
        >
          {item}
        </animate.div>
      ))}
    </Presence>
  );
}
```

**Presence Props:**

- `mode`: `'sync'` (default) | `'wait'` | `'popLayout'`
  - `sync`: Exiting and entering animate simultaneously
  - `wait`: Exiting complete before entering start
  - `popLayout`: Exiting removed from layout immediately
- `initial`: Skip enter animation on initial mount (default: `true`)
- `onExitComplete`: Callback when all exits complete

**Presence Hooks:**

```tsx
import { usePresence, useIsPresent } from 'react-ui-animate';

function AnimatedItem() {
  const [isPresent, onExitComplete] = usePresence();
  const isPresent2 = useIsPresent(); // Simple boolean check

  // Use isPresent to conditionally render or animate
  return isPresent ? <div>Content</div> : null;
}
```

### 6. Gestures

React to user gestures with built-in hooks:

#### useDrag

Handle drag gestures:

```tsx
import { useValue, animate, useDrag, withSpring } from 'react-ui-animate';

function Draggable() {
  const ref = useRef(null);
  const [x, setX] = useValue(0);
  const [y, setY] = useValue(0);

  useDrag(ref, ({ down, movement }) => {
    if (down) {
      setX(movement.x);
      setY(movement.y);
    } else {
      setX(withSpring(0));
      setY(withSpring(0));
    }
  });

  return (
    <animate.div
      ref={ref}
      style={{
        width: 100,
        height: 100,
        backgroundColor: 'blue',
        translateX: x,
        translateY: y,
      }}
    />
  );
}
```

#### useMove

Track pointer movement:

```tsx
import { useMove } from 'react-ui-animate';

useMove(ref, ({ movement }) => {
  console.log('Moving:', movement.x, movement.y);
});
```

#### useScroll

React to scroll events:

```tsx
import { useScroll } from 'react-ui-animate';

useScroll(ref, ({ scroll }) => {
  console.log('Scrolled:', scroll.x, scroll.y);
});
```

#### useWheel

Handle wheel events:

```tsx
import { useWheel } from 'react-ui-animate';

useWheel(ref, ({ delta }) => {
  console.log('Wheel delta:', delta.x, delta.y);
});
```

#### useScrollProgress

Track scroll progress:

```tsx
import { useScrollProgress } from 'react-ui-animate';

const progress = useScrollProgress(ref, {
  start: 0,      // Start tracking at 0% scroll
  end: 100,      // End tracking at 100% scroll
  axis: 'y',    // 'x' or 'y'
});
```

### 7. Utilities

#### makeAnimated

Create custom animated components:

```tsx
import { makeAnimated } from 'react-ui-animate';

const AnimatedButton = makeAnimated('button');
const AnimatedSection = makeAnimated('section');

<AnimatedButton animate={{ scale: withSpring(1.1) }}>
  Custom Button
</AnimatedButton>
```

#### to (Interpolation)

Map values between ranges:

```tsx
import { to } from 'react-ui-animate';

const interpolate = to([0, 100], [0, 500]);
interpolate(50); // Returns 250

// Color interpolation
const colorInterpolate = to([0, 1], ['red', 'blue']);
colorInterpolate(0.5); // Returns interpolated color
```

#### combine

Combine multiple animated values:

```tsx
import { combine, useValue } from 'react-ui-animate';

const [x, setX] = useValue(0);
const [y, setY] = useValue(0);
const combined = combine(x, y, (x, y) => x + y);
```

### 8. Additional Hooks

#### useInView

Detect when elements enter the viewport:

```tsx
import { useInView } from 'react-ui-animate';

const ref = useRef(null);
const isInView = useInView(ref, {
  threshold: 0.5,
  once: true,
});
```

#### useOutsideClick

Detect clicks outside an element:

```tsx
import { useOutsideClick } from 'react-ui-animate';

const ref = useRef(null);
useOutsideClick(ref, () => {
  console.log('Clicked outside!');
});
```

---

## Complete Examples

### Modal with Exit Animation

```tsx
import { useState, useRef } from 'react';
import {
  Presence,
  animate,
  useOutsideClick,
  withSpring,
  withTiming,
} from 'react-ui-animate';

function Modal({ isOpen, onClose }) {
  const ref = useRef(null);
  useOutsideClick(ref, onClose);

  return (
    <Presence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <animate.div
            key="backdrop"
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0)',
              opacity: 0,
            }}
            animate={{
              backgroundColor: withTiming('rgba(0,0,0,0.5)'),
              opacity: withTiming(1),
            }}
            exit={{
              backgroundColor: withTiming('rgba(0,0,0,0)'),
              opacity: withTiming(0),
            }}
          />

          {/* Modal */}
          <animate.div
            key="modal"
            ref={ref}
            style={{
              position: 'fixed',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              scale: 0.8,
              opacity: 0,
            }}
            animate={{
              scale: withSpring(1),
              opacity: withSpring(1),
            }}
            exit={{
              scale: withSpring(0.8),
              opacity: withSpring(0),
            }}
          >
            <div style={{ backgroundColor: 'white', padding: 20 }}>
              Modal Content
            </div>
          </animate.div>
        </>
      )}
    </Presence>
  );
}
```

### Scroll-Triggered Animations

```tsx
import { animate, withSpring, withTiming } from 'react-ui-animate';

function FeatureCard({ title, description }) {
  return (
    <animate.div
      style={{
        opacity: 0,
        translateY: 50,
        scale: 0.9,
      }}
      view={{
        opacity: withTiming(1, { duration: 600 }),
        translateY: withSpring(0),
        scale: withSpring(1),
      }}
      viewOptions={{ threshold: 0.3, once: true }}
    >
      <h3>{title}</h3>
      <p>{description}</p>
    </animate.div>
  );
}
```

### Interactive Button

```tsx
import { animate, withSpring, hoverScale, pressScale } from 'react-ui-animate';

<animate.button
  style={{
    padding: '12px 24px',
    backgroundColor: '#3399ff',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
  }}
  hover={hoverScale}
  press={pressScale}
>
  Click Me
</animate.button>
```

---

## API Reference

### Animation Descriptors

| Descriptor | Description | Options |
|------------|-------------|---------|
| `withSpring(to, options?)` | Physics-based spring | `stiffness`, `damping`, `mass`, `from`, callbacks |
| `withTiming(to, options?)` | Time-based animation | `duration`, `easing`, `from`, callbacks |
| `withDecay(options)` | Momentum decay | `velocity`, `clamp`, callbacks |
| `withSequence(animations)` | Run sequentially | `animations` array, callbacks |
| `withLoop(animation, iterations)` | Repeat animation | `iterations` (0 = infinite), callbacks |
| `withDelay(ms)` | Add delay | `delay` in milliseconds |

### Animate Component Props

| Prop | Type | Description |
|------|------|-------------|
| `animate` | `AnimateProp` | Animations on mount/update |
| `exit` | `AnimateProp` | Animations on unmount (requires `Presence`) |
| `hover` | `AnimateProp` | Animations on hover |
| `press` | `AnimateProp` | Animations on press (mousedown/touchstart) |
| `focus` | `AnimateProp` | Animations on focus |
| `view` | `AnimateProp` | Animations when entering viewport |
| `viewOptions` | `UseInViewOptions` | IntersectionObserver options |

### Callbacks

All descriptors support optional callbacks:

```tsx
withSpring(100, {
  onStart: () => console.log('Started'),
  onChange: (value) => console.log('Value:', value),
  onComplete: () => console.log('Completed'),
})
```

---

## TypeScript Support

Full TypeScript support is included. All components, hooks, and utilities are fully typed.

---

## Performance

- Animations run on the GPU when possible
- Automatic batching of style updates
- Optimized re-renders
- Tree-shakeable exports

---

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Documentation

For detailed documentation and more examples, visit the [official documentation](https://react-ui-animate.js.org/).

---

## License

MIT © [Dipesh Rai](https://github.com/dipeshrai123)
