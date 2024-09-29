# React UI Animate

[![npm version](https://badge.fury.io/js/react-ui-animate.svg)](https://badge.fury.io/js/react-ui-animate)

> Create smooth animations and interactive gestures in React applications effortlessly.

### Install

You can install react-ui-animate via `npm` or `yarn`:

```sh
npm i react-ui-animate
```

```sh
yarn add react-ui-animate
```

### Getting Started

The `react-ui-animate` library provides a straightforward way to add animations and gestures to your React components. Here’s how you can get started quickly:

```javascript
import { animate, useValue } from 'react-ui-animate';

export default function () {
  const opacity = useValue(0); // Initialize

  return (
    <>
      <animate.div
        style={{
          opacity: opacity.value, // Apply
          width: 100,
          padding: 20,
          background: '#39F',
        }}
      >
        ANIMATED
      </animate.div>
      
      <button 
        onClick={() => {
          opacity.value = 1 // Update
        }}
      >
        Animate Me
      </button>
    </>
  );
}
```

In this example, clicking the `Animate Me` button changes the opacity from 0 to 1.

---

### Implementation Steps

#### 1. Initialize

The `useValue()` hook is central to creating animations. It initializes an animated value and allows you to seamlessly update it to create dynamic effects.

```javascript
const opacity = useValue(0); // Initialize a animation value 0
```

#### 2. Apply

`animate.div` is a special component designed to work with `useValue()`. It simplifies animating elements by directly using animated values.

```jsx
import { useValue, animate } from 'react-ui-animate'

const width = useValue(100); // Start with a width of 100

<animate.div
  style={{
    width: width.value,
    height: 100,
    backgroundColor: '#39f',
  }}
/>;
```

#### 3. Update

To update the value simply assign the initialized animated node with a value.

```jsx
import { useValue, withSpring } from 'react-ui-animate';

const width = useValue(100);

<button 
  onClick={() => {
      // Update
      width.value = withSpring(400); 
  }}
>
  Update
</button>
```

In this example, `withSpring` runs spring animation when updating the value.

---

#### `interpolate`

The `interpolate()` function is useful for mapping values from one range to another, enabling more complex animations.

```javascript
import { useValue, animate, interpolate } from 'react-ui-animate';

const width = useValue(100);

<animate.div
  style={{
    width: width.value,
    height: 100,
    backgroundColor: interpolate(width.value, [100, 200], ['red', 'blue']),
  }}
/>;
```

In this example, as the width changes from 100 to 200, the background color smoothly transitions from red to blue.

#### Modifiers

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
x.value = withSequence([withSpring(50), withTiming(100), withEase(200)]);
```

#### `useMount()`

The `useMount()` hook facilitates managing the mounting and unmounting of a component with animations.

```jsx
import { useMount } from 'react-ui-animate';

export default function App() {
  const [visible, setVisible] = useState(false);

  const open = useMount(visible);

  return open((animation, mounted) => mounted && <animate.div />);
}
```

In this example,

1. A state variable `visible` determines whether the component is visible.
2. The `useMount` hook takes `visible` as an argument and provides animation states for mounting and unmounting.
3. The `open` function, returned by `useMount`, is used to conditionally render `animate.div` based on the `mounted` boolean and apply the transition animation.

---

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
import { useValue, animate, useDrag, withSpring } from 'react-ui-animate';

export const Draggable = () => {
  const translateX = useValue(0);

  const bind = useDrag(function ({ down, movementX }) {
    translateX.value = down ? movementX : withSpring(0);
  });

  return (
    <animate.div
      {...bind()}
      style={{
        width: 100,
        height: 100,
        backgroundColor: '#3399ff',
        translateX: translateX.value,
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
