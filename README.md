# React UI Animate

[![npm version](https://badge.fury.io/js/react-ui-animate.svg)](https://badge.fury.io/js/react-ui-animate)

> Create smooth animations and interactive gestures in React applications effortlessly.

## Why react-ui-animate?

Most animation libraries make you choose: a small core that leaves gestures to a second dependency, or a full-featured library that ships a lot of code you don't use. react-ui-animate gives you spring animation, layout transitions, and gestures (hover, press, pan, scroll, swipe...) from one package, with a smaller footprint than the alternatives once you account for what it actually takes to match that feature set.

Measured by bundling the same component - a spring-driven animation with hover and press interactions, through esbuild and gzipping the output (React externalized in all cases):

| Library | Gzip size |
|---|---|
| **react-ui-animate** | **14.2 KB** |
| react-spring + `@use-gesture/react` (needed for hover/press) | 25.9 KB |
| framer-motion (`LazyMotion` + `m`, size-optimized import) | 27.4 KB |
| framer-motion (`motion`, typical import) | 41.0 KB |

react-spring alone is smaller (17.4 KB) if you only need animation and no gestures, but the moment you need hover, press, or drag, you're pulling in `@use-gesture/react` on top, which is where the comparison above starts.

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
- **`layout` / `layoutId`** — automatic FLIP-style layout and shared-element transitions
- **`useValue`** — create and control animated values programmatically, with interpolation via `.to()`
- **Descriptors** — `withSpring`, `withTiming`, `withDecay`, `withSequence`, `withLoop`, `withDelay`, `withStagger`
- **`Presence`** — mount/unmount (exit) animations
- **Gestures** — a unified `useGesture` + `Gesture.Pan/Move/Wheel/Scroll/Swipe/Hover` API, plus `useScrollProgress`
- **Recipes** — a library of ready-made animations (`fadeIn`, `slideInUp`, `scaleIn`, `hoverScale`, etc.)
- Fully typed, tree-shakeable, zero runtime dependencies

## Documentation

📖 Full guides, API reference, and examples: **[react-ui-animate.js.org](https://react-ui-animate.js.org/)**

## License

MIT © [Dipesh Rai](https://github.com/dipeshrai123)
