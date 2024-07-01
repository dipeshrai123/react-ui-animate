# React UI Animate

[![npm version](https://badge.fury.io/js/react-ui-animate.svg)](https://badge.fury.io/js/react-ui-animate)

> Create smooth animations and interactive gestures in React applications effortlessly.

### Install

You can install react-ui-animate via npm or yarn:

```sh
npm i react-ui-animate
```

```sh
yarn add react-ui-animate
```

### Getting Started

The `react-ui-animate` library provides a straightforward way to add animations and gestures to your React components. Here’s how you can get started quickly:

```javascript
import { AnimatedBlock, useAnimatedValue } from 'react-ui-animate';

export default function () {
  // Initialize an animated opacity value
  const opacity = useAnimatedValue(0);

  return (
    <div>
      {/* AnimatedBlock component uses the animated opacity value */}
      <AnimatedBlock
        style={{
          opacity: opacity.value, // using opacity with value property
          width: 100,
          padding: 20,
          background: '#39F',
        }}
      >
        ANIMATED
      </AnimatedBlock>

      {/* Clicking the button changes the opacity smoothly to 1 */}
      <button onClick={() => (opacity.value = 1)}>Animate Me</button>
    </div>
  );
}
```

In this example, clicking the "Animate Me" button smoothly changes the opacity of the animated block from 0 to 1.

### Key Features

#### `useAnimatedValue()`

The `useAnimatedValue()` hook is central to creating animations. It initializes an animated value and allows you to seamlessly update it to create dynamic effects.

```javascript
const opacity = useAnimatedValue(0); // Start with opacity set to 0

// Use in style
style={{
  opacity: opacity.value, // Access the animated opacity value
}}

// Update the value on user interaction
onClick={() => (opacity.value = 1)} // Changes the opacity to 1
```

#### `AnimatedBlock`

`AnimatedBlock` is a special component designed to work with `useAnimatedValue()`. It simplifies animating elements by directly using animated values.

```javascript
const width = useAnimatedValue(100); // Start with a width of 100

<AnimatedBlock
  style={{
    width: width.value,
    height: 100,
    backgroundColor: '#39f',
  }}
/>;
```

#### `interpolate`

The `interpolate()` function is useful for mapping values from one range to another, enabling more complex animations.

```javascript
import { useAnimatedValue, AnimatedBlock, interpolate } from 'react-ui-animate';

const width = useAnimatedValue(100); // Start with a width of 100

<AnimatedBlock
  style={{
    width: width.value,
    height: 100,
    backgroundColor: interpolate(width.value, [100, 200], ['red', 'blue']),
  }}
/>;
```

In this example, as the width changes from 100 to 200, the background color smoothly transitions from red to blue.

## Documentation

For detailed documentation and examples, visit the official [react-ui-animate documentation](http://react-ui-animate.js.org/).

## License

This library is licensed under the MIT License.
