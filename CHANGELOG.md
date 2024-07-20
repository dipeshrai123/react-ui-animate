# Changelog

All notable changes to this project will be documented in this file.

## [3.3.0] - 2024-07-15

### Added

- New `withConfig` function added for passing default configuration.
- Decay animation implemented with configurations `velocity`, `deceleration` and `decay`

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

- Gestures hooks doesn't get applied on the re-mounted elements (After the mount)
- Animation values not animating when applied on the re-mounted elements
