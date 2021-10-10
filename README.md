# React UI Animate

[![npm version](https://badge.fury.io/js/react-ui-animate.svg)](https://badge.fury.io/js/react-ui-animate)

> React library for gestures and animation

### Install

Install with npm:

```sh
npm i react-ui-animate
```

or
Install with yarn:

```sh
yarn add react-ui-animate
```

### Getting Started

`react-ui-animate` provides lots of easy to use APIs to create smooth animations and gestures.

```javascript
import { AnimatedBlock, useAnimatedValue } from "react-ui-animate";

export default function () {
  const opacity = useAnimatedValue(0); // It initializes opacity object with value 0.

  return (
    <div>
      {/* AnimatedBlock component can read useAnimatedValue() */}
      <AnimatedBlock
        style={{
          opacity: opacity.value, // using opacity with value property
          width: 100,
          padding: 20,
          background: "#39F",
        }}
      >
        ANIMATED
      </AnimatedBlock>

      {/* Assigning value to 1 auto animates from initialized value 0 to 1 smoothly */}
      <button onClick={() => (opacity.value = 1)}>Animate Me</button>
    </div>
  );
}
```

Animates opacity from 0 to 1.

#### `useAnimatedValue()`

`useAnimatedValue()` is very flexible and powerful hook that lets you define animated values. It accepts a value and returns a node with same value on `value` property. Whenever `value` property is assigned to another value, it auto animates from one value to another.

```javascript
const opacity = useAnimatedValue(0); // initialize with 0 opacity

...
style={{
    opacity: opacity.value // access with `.value`
}}
...

...
onClick={() => opacity.value = 1} // Assignment
...
```

### `AnimatedBlock`

`AnimatedBlock` is a `div` component which can accept the animation node from `useAnimatedValue()` hook.

```javascript
const width = useAnimatedValue(100);

<AnimatedBlock
  style={{
    width: width.value,
    height: 100,
    backgroundColor: "#39f",
  }}
/>;
```

### `interpolate`

The `interpolate()` function allows animated node value to map from input ranges to different output ranges. By default, it will extrapolate the curve beyond the ranges given, but you can also have it clamp the output value.

```javascript
import { useAnimatedValue, AnimatedBlock, interpolate } from "react-ui-animate";

const width = useAnimatedValue(100);

<AnimatedBlock
  style={{
    width: width.value,
    height: 100,
    backgroundColor: interpolate(width.value, [100, 200], ["red", "blue"]),
  }}
/>;
```

`backgroundColor` is interpolated from input range `[100, 200]` to output range `["red", "blue"]`. So, when the width changes from 100 to 200, `backgroundColor` will change from `red` to `blue`.

## Documentation

The official documentation are now published at http://react-ui-animate.js.org/

## License

MIT
