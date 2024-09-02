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
import { animate, useAnimatedValue } from 'react-ui-animate';

export default function () {
  // Initialize an animated opacity value
  const opacity = useValue(0);

  return (
    <div>
      {/* animate.div component uses the animated opacity value */}
      <animate.div
        style={{
          opacity: opacity.value, // using opacity with value property
          width: 100,
          padding: 20,
          background: '#39F',
        }}
      >
        ANIMATED
      </animate.div>

      {/* Clicking the button changes the opacity smoothly to 1 */}
      <button onClick={() => (opacity.value = 1)}>Animate Me</button>
    </div>
  );
}
```

In this example, clicking the "Animate Me" button smoothly changes the opacity of the animated block from 0 to 1.

### Key Features

#### `useValue()`

The `useValue()` hook is central to creating animations. It initializes an animated value and allows you to seamlessly update it to create dynamic effects.

```javascript
const opacity = useValue(0); // Start with opacity set to 0

// Use in style
style={{
  opacity: opacity.value, // Access the animated opacity value
}}

// Update the value on user interaction
onClick={() => (opacity.value = 1)} // Changes the opacity to 1
```

#### `animate.div`

`animate.div` is a special component designed to work with `useValue()`. It simplifies animating elements by directly using animated values.

```javascript
const width = useValue(100); // Start with a width of 100

<animate.div
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
import { useValue, animate, interpolate } from 'react-ui-animate';

const width = useValue(100); // Start with a width of 100

<animate.div
  style={{
    width: width.value,
    height: 100,
    backgroundColor: interpolate(width.value, [100, 200], ['red', 'blue']),
  }}
/>;
```

In this example, as the width changes from 100 to 200, the background color smoothly transitions from red to blue.

#### Dynamic Animations and Sequence Transitions

You can dynamically modify animation configurations by assigning values to an animated value using various animation functions.

To apply a spring animation and update the value to `10`:

```jsx
x.value = withSpring(10);
```

To apply a timing animation with a duration of 5000 milliseconds:

```jsx
x.value = withTiming(10, { duration: 5000 });
```

To create sequential transitions using the `withSequence` function with dynamic modifiers like `withSpring` and `withTiming`:

```jsx
x.value = withSequence([withSpring(50), withTiming(100), 200]);
```

To delay an animation using the withDelay function:

```jsx
x.value = withDelay(1000, withSpring(100));
```

In this example, a spring animation to `100` will be applied after a 1-second delay.

#### `useMount()`

The `useMount()` hook facilitates managing the mounting and unmounting of a component with animations.

```jsx
import { useMount } from 'react-ui-animate';

export default function App() {
  const [visible, setVisible] = useState(false);

  const open = useMount(visible, {
    from: 0,
    enter: 1,
    exit: 0,
  });

  return open((animation, mounted) => mounted && <animate.div />);
}
```

In this example,

1. A state variable `visible` determines whether the component is visible.
2. The `useMount` hook takes `visible` as an argument and provides animation states for mounting and unmounting.
3. The `open` function, returned by `useMount`, is used to conditionally render `animate.div` based on the `mounted` boolean and apply the transition animation.

### Gestures

The `react-ui-animate` library also provides several hooks for handling different types of gestures:

1. `useDrag`: Handles drag gestures on elements.
2. `useMouseMove`: Handles mouse movements.
3. `useScroll`: Handles scrolling of the document.
4. `useWheel`: Handles wheel rotation gestures.
5. `useGesture`: Handles combinations of various gestures.

**Example**: `useDrag`

Here’s an example of using the useDrag hook to enable drag gestures:

```jsx
import { useValue, animate, useDrag } from 'react-ui-animate';

export const Draggable = () => {
  const translateX = useValue(0);

  const bind = useDrag(function ({ down, movementX }) {
    translateX.value = down ? movementX : 0;
  });

  return (
    <animate.div
      {...bind()}
      style={{
        width: 100,
        height: 100,
        backgroundColor: '#3399ff',
        translateX: translateX.value, // Use translateX with animated value
      }}
    />
  );
};
```

In this example, the blue block can be dragged horizontally by clicking and dragging.

## Documentation

For detailed documentation and examples, visit the official [react-ui-animate documentation](http://react-ui-animate.js.org/).

## License

This library is licensed under the MIT License.
