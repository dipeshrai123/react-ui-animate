# Changelog

All notable changes to this project will be documented in this file.

## [3.3.0] - 2024-07-15

### Added

- New `withConfig` function added for passing default configuration.
- Decay animation implemented with configurations `velocity`, `deceleration` and `decay`.

```js
const animation = useAnimatedValue(0, { decay: true, velocity: 1 });
```

### Changed

- Refactored `withSpring`, `withTiming` and `withEase` to use `withConfig` internally.
- Updated `makeFluid` to `makeAnimated` and `fluid` to `animate`.

### Fixed

- Gestures hooks issue with not showing the suggestions on callback arguments fixed.

## [3.3.1] - 2024-07-20

### Fixed

- Gestures hooks doesn't get applied on the re-mounted elements (After the mount).
- Animation values not animating when applied on the re-mounted elements.

## [4.0.0]

### Removed

- Removed `AnimatedBlock`, `AnimatedInline` and `AnimatedImage` HOCs.

### Added

- `useAnimatedValue` can accept array of numbers

```jsx
const animations = useAnimatedValue([0, 100, 200]);
```

And it can be updated like

```jsx
animations.value = [200, 400, 500];
```

Or it also can be used with animation modifiers

```jsx
animations.value = [
  withSpring(200),
  withTiming(400),
  withConfig(500, AnimationConfigUtils.BOUNCE),
];
```

### Fixed

- with\* function config overrides bug fixed.
