# React UI Animate

[![npm version](https://badge.fury.io/js/react-ui-animate.svg)](https://badge.fury.io/js/react-ui-animate)

Spring animations, layout transitions, and gestures for React, in one package.

## Why react-ui-animate?

Most animation libraries make you choose: a small core that leaves gestures to a second dependency, or a full-featured library that ships a lot of code you don't use. react-ui-animate gives you spring animation, layout transitions, exit animations, and a full gesture set (hover, press, pan, drag, swipe, wheel, scroll, pinch, rotate) from one package, and it's still smaller than stitching the equivalent together from other libraries.

Measured by bundling the same component - a spring-driven box with hover and press interactions - through esbuild and gzipping the output (React externalized in all cases):

| Library | Gzip size |
|---|---|
| **react-ui-animate** | **~15 KB** |
| react-spring + `@use-gesture/react` (needed for hover/press) | ~25 KB |
| framer-motion (`LazyMotion` + `m`, size-optimized import) | ~27 KB |
| framer-motion (`motion`, typical import) | ~40 KB |

react-spring alone is smaller (~17 KB) if all you need is animation with no gestures, but the moment you add hover, press, or drag, you're pulling in `@use-gesture/react` on top - that's the comparison above.

We've added a lot of surface area since we last measured this - layout animations, `Presence`, `Reorder`, drag with momentum, scroll-linked hooks, pinch/rotate gestures - and the minimal-usage number moved from ~14 KB to ~15 KB as a result. That's the honest tradeoff of one shared gesture engine backing hover, press, pan, drag, and swipe: the core grows as the API grows, even if a given app only touches one corner of it. What hasn't changed is the comparison itself - framer-motion is the only other library here with layout transitions and exit animations, and it still costs 2-2.5x more to get them.

## Installation

```sh
npm install react-ui-animate
```

```sh
yarn add react-ui-animate
```

## Quick Start

```tsx
import { animate, withSpring } from 'react-ui-animate';

function App() {
  return (
    <animate.div
      style={{ width: 100, height: 100, backgroundColor: 'blue', scale: 0.5, opacity: 0 }}
      animate={{ scale: withSpring(1), opacity: withSpring(1) }}
    />
  );
}
```

## Features

- **`animate.*`** — animated versions of every HTML element, driven by `animate`, `hover`, `press`, `focus`, and `view` props
- **`layout` / `layoutId`** — automatic FLIP-style layout and shared-element transitions, grouped with `LayoutGroup`
- **`useValue`** — create and control animated values programmatically, with interpolation via `.to()`
- **Descriptors** — `withSpring`, `withTiming`, `withDecay`, `withSequence`, `withLoop`, `withDelay`, `withStagger`, `withKeyframes`, `withParallel`, `withCustom`
- **`Presence`** — mount/unmount (exit) animations
- **Gestures** — one `useGesture` hook and `Gesture.Pan/Move/Wheel/Scroll/Swipe/Hover/Pinch/Rotate` API covering everything from hover states to two-finger pinch/rotate
- **`useDrag`** — drag a value with bounds, rubber-banding, and momentum built in
- **`Reorder`** — drag-to-reorder lists out of the box
- **`useScrollProgress`** / **`useScrollReveal`** / **`useInView`** / **`useOutsideClick`** — the scroll and viewport hooks you'd otherwise wire up by hand
- **Recipes** — 30+ ready-made animations (`fadeIn`, `slideInUp`, `scaleIn`, `hoverScale`, `bounceIn`, etc.)
- Fully typed, tree-shakeable, zero runtime dependencies

## Documentation

Full guides, API reference, and examples: **[react-ui-animate.js.org](https://react-ui-animate.js.org/)**

## License

MIT © [Dipesh Rai](https://github.com/dipeshrai123)
