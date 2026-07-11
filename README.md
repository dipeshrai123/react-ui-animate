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
- **Gestures** — `useDrag`, `useMove`, `useScroll`, `useWheel`, `useScrollProgress`
- **Recipes** — a library of ready-made animations (`fadeIn`, `slideInUp`, `scaleIn`, `hoverScale`, etc.)
- Fully typed, tree-shakeable, zero runtime dependencies

## Documentation

📖 Full guides, API reference, and examples: **[react-ui-animate.js.org](https://react-ui-animate.js.org/)**

## License

MIT © [Dipesh Rai](https://github.com/dipeshrai123)
