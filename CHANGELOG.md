# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### 🚨 Breaking Changes

- **API cleanup — removed unused/leaked exports, one rename**:

  - `isAnimateValue` and `GesturePhase` are no longer exported — both were
    internal implementation details with no real consumer path. Use `phase`
    directly off gesture events instead of comparing against `GesturePhase`.
  - The 40 flat recipe exports (`fadeIn`, `slideInUp`, `scaleIn`, ...) have
    been removed in favor of the `recipes` namespace object, which already
    contained the same values:

    ```tsx
    // Before
    import { fadeIn, slideInUp } from 'react-ui-animate';

    // After
    import { recipes } from 'react-ui-animate';
    // recipes.fadeIn, recipes.slideInUp
    ```

  - The standalone `to()` interpolation function has been renamed to
    `interpolate()` to avoid colliding with `Descriptor.to` and
    `AnimateValue.prototype.to()` (the reactive interpolation method most
    code should use instead — `to()` is now only for one-off mapping of a
    plain number):

    ```tsx
    // Before
    import { to } from 'react-ui-animate';
    to(50, [0, 100], [0, 1]);

    // After
    import { interpolate } from 'react-ui-animate';
    interpolate(50, [0, 100], [0, 1]);
    ```

  - `useDrag`'s callbacks have been renamed to match `Gesture.*`'s
    vocabulary:

    ```tsx
    // Before
    useDrag(ref, { onDragStart, onDrag, onDragEnd });

    // After
    useDrag(ref, { onStart, onChange, onEnd });
    ```

- **`useMount` hook removed**: The `useMount` hook has been removed. Use the new `Presence` component instead for mount/unmount animations:

  ```tsx
  // Before
  import { useMount } from 'react-ui-animate';

  const mounted = useMount(open, { from: 0, enter: 1, exit: 0 });

  return <>{mounted((animation, mounted) => mounted && <div>...</div>)}</>;

  // After
  import { Presence } from 'react-ui-animate';

  <Presence>
    {open && (
      <animate.div
        key="item"
        style={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
    )}
  </Presence>;
  ```

- **`Mount` component removed**: The `Mount` component has been removed. Use the new `Presence` component instead:

  ```tsx
  // Before
  import { Mount } from 'react-ui-animate';

  <Mount state={open} from={0} enter={1} exit={0}>
    {(animation) => <div>...</div>}
  </Mount>;

  // After
  import { Presence } from 'react-ui-animate';

  <Presence>
    {open && (
      <animate.div
        key="item"
        style={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
    )}
  </Presence>;
  ```

- **Dependency on `@raidipesh78/re-motion` removed**: The library no longer depends on `@raidipesh78/re-motion`. The `animate` and `makeAnimated` APIs are now built-in. While the API should be compatible, there may be subtle differences in behavior. If you encounter issues, please report them.

### ✨ New Features

- **`Gesture.Pinch()` and `Gesture.Rotate()`**: two-finger pinch/zoom and
  rotation, built on a new multi-pointer tracking layer. Both can be
  registered together on the same ref and read from the same two-pointer
  stream simultaneously — they don't compete with each other, only with
  single-pointer gestures (a second finger joining mid-drag automatically
  cancels an in-flight `Pan`, handing off to `Pinch`/`Rotate`):

  ```tsx
  import { Gesture, useGesture, useValue, withSpring } from 'react-ui-animate';

  const [scale, setScale] = useValue(1);
  const startScale = useRef(1);

  useGesture(
    ref,
    Gesture.Pinch()
      .threshold(0.02)
      .onStart(() => { startScale.current = scale.current; })
      .onUpdate(({ scale: s }) => setScale(startScale.current * s))
      .onEnd(() => setScale(withSpring(Math.min(Math.max(scale.current, 0.5), 3))))
  );
  ```

  `Gesture.Rotate()` follows the same shape, reporting cumulative `rotation`
  in degrees instead of `scale`.

- **`prefers-reduced-motion` support**: `timing`, `spring`, and `decay` (and everything built on them — `withSpring`, `withTiming`, `withDecay`, recipes, etc.) now check the user's OS-level `prefers-reduced-motion` setting and, when enabled, resolve straight to the animation's end state instead of animating. Use `setReducedMotion(true | false | null)` to override the media query (e.g. for testing, or an in-app "reduce motion" toggle), and `isReducedMotionEnabled()` to read the current effective value:

  ```tsx
  import { setReducedMotion, isReducedMotionEnabled } from 'react-ui-animate';

  setReducedMotion(true); // force-disable animation everywhere
  setReducedMotion(null); // go back to following the OS setting
  ```

- **`withKeyframes`**: Animate a value through a list of intermediate stops in one call, instead of hand-rolling a `withSequence` of `withTiming` steps:

  ```tsx
  import { useValue, withKeyframes } from 'react-ui-animate';

  const [x, setX] = useValue(0);

  setX(withKeyframes([0, 100, 50, 100], { duration: 600 }));

  // per-step overrides
  setX(
    withKeyframes([0, { to: 100, duration: 200, easing: Easing.linear }, 50])
  );
  ```

- **Animation Recipes**: Added 40+ pre-built animation recipes for common use cases:

  - Fade animations: `fadeIn`, `fadeOut`, `fadeInUp`, `fadeInDown`, `fadeInLeft`, `fadeInRight`
  - Slide animations: `slideInUp`, `slideInDown`, `slideInLeft`, `slideInRight`, `slideOutUp`, `slideOutDown`, `slideOutLeft`, `slideOutRight`
  - Scale animations: `scaleIn`, `scaleOut`, `scaleUp`, `scaleDown`
  - Bounce animations: `bounceIn`, `bounceOut`
  - Rotate animations: `rotateIn`, `rotateOut`, `spin`
  - Zoom animations: `zoomIn`, `zoomOut`
  - Flip animations: `flipX`, `flipY`
  - Combined animations: `slideFadeIn`, `slideFadeOut`, `scaleFadeIn`, `scaleFadeOut`
  - State animations: `hoverScale`, `hoverLift`, `hoverGlow`, `pressScale`, `pressDown`
  - Exit animations: `exitFade`, `exitSlideUp`, `exitSlideDown`, `exitScale`

  ```tsx
  import { animate, fadeIn, slideInUp } from 'react-ui-animate';

  <animate.div animate={fadeIn} />
  <animate.div animate={slideInUp} />
  ```

- **`animate` prop**: Added declarative `animate` prop for easier animation setup:

  ```tsx
  <animate.div
    animate={{
      opacity: withSpring(1),
      translateY: withSpring(0),
    }}
  />
  ```

- **Low-level Animation Drivers**: Exposed low-level animation drivers for advanced use cases:

  - `timing` - Timing-based animations
  - `spring` - Spring physics animations
  - `decay` - Decay animations
  - `parallel` - Run animations in parallel
  - `sequence` - Run animations in sequence
  - `loop` - Loop animations
  - `delay` - Delay animations

  ```tsx
  import { timing, spring, parallel } from 'react-ui-animate';

  const animation = parallel([
    timing(100, { duration: 1000 }),
    spring(200, { stiffness: 100 }),
  ]);
  ```

- **`Presence` Module**: New `Presence` component for managing enter/exit animations (replaces the removed `Mount` component):

  - `Presence` - Component wrapper for exit animations
  - `usePresence` - Hook to access presence context
  - `useIsPresent` - Hook to check if element is present

  ```tsx
  import { Presence, usePresence } from 'react-ui-animate';

  <Presence>
    {isVisible && (
      <animate.div key="modal" animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
    )}
  </Presence>;
  ```

- **State Animations**: Enhanced state-based animations with new props:

  - `hover` - Animations on hover
  - `press` - Animations on press
  - `focus` - Animations on focus
  - `view` - Animations when element enters viewport

  ```tsx
  <animate.div
    hover={{ scale: 1.1 }}
    press={{ scale: 0.9 }}
    focus={{ outline: '2px solid blue' }}
    view={{ opacity: 1 }}
  />
  ```

- **`makeAnimated` utility**: Create custom animated components:

  ```tsx
  import { makeAnimated } from 'react-ui-animate';

  const AnimatedButton = makeAnimated('button');

  <AnimatedButton animate={{ scale: 1.1 }} />;
  ```

- **`viewOptions` prop**: Added `viewOptions` prop for configuring IntersectionObserver when using the `view` prop:

  ```tsx
  <animate.div
    view={{ opacity: 1 }}
    viewOptions={{ threshold: 0.5, rootMargin: '50px' }}
  />
  ```

- **`useScrollProgress` hook**: New hook for tracking scroll progress:

  ```tsx
  import { useScrollProgress } from 'react-ui-animate';

  const progress = useScrollProgress(ref, {
    offset: ['start end', 'end start'],
  });
  ```

- **`useRecognizer` hook**: New low-level hook for creating custom gesture recognizers:

  ```tsx
  import { useRecognizer } from 'react-ui-animate';

  useRecognizer(ref, { type: 'pan', onStart, onMove, onEnd });
  ```

### 🐛 Bug Fixes

- Fixed `useValue`'s `set` function and `controls` object being recreated on
  every render instead of holding a stable identity like `useState`'s
  setter. A fresh identity each render would spuriously re-run any
  `useEffect` that (correctly, per `exhaustive-deps`) listed it as a
  dependency — restarting whatever animation that effect was driving any
  time an unrelated parent re-render happened.
- Fixed `Gesture.Pan()` and `Gesture.Swipe()` both firing when registered on
  the same element for a single fast drag (`onEnd` and `onSwipe` used to
  both fire for what the user experienced as one gesture) — the first one
  to actually recognize the gesture now wins for that pointer stream; the
  other stays quiet instead of firing a contradictory second callback.
- Fixed exit animation callbacks not firing issue
- Fixed multiple state animation bug where animations would conflict
- Fixed animation glitches on re-render
- Fixed boxShadow and textShadow string properties not animating correctly in state animations
- Fixed exit animation with different props implementation
- Fixed number/string interpolation issues
- Fixed Presence exit prop issue
- Fixed spring animation default behavior
- Fixed circular dependencies
- Optimized animation performance and re-renders
- Fixed animation restart behavior

### 🔧 Improvements

- Added comprehensive test coverage for all APIs
- Improved examples organization and structure
- Enhanced TypeScript types and exports
- Better error handling and edge cases
- Performance optimizations across the board
- Improved documentation and examples

### 📚 Documentation

- Added comprehensive examples for all animation descriptors
- Added examples for utilities (Easing, combine, to)
- Added examples for components (animate, makeAnimated)
- Added examples for Presence module
- Added examples for state animations
- Added examples for all recipes
- Improved example organization and navigation

---

## [5.2.0] - Previous Release

See git history for previous changelog entries.
