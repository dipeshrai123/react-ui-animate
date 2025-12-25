# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### 🚨 Breaking Changes

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
