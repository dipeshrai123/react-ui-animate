# usePresence vs useIsPresent: When to Use Each

## Overview

Both hooks provide access to presence state when components are inside a `<Presence>` component. They help you react to enter/exit animations.

## `useIsPresent()` - Simple Boolean Check

**Returns:** `boolean`

**Use when:**
- You only need to know if the component is present (not exiting)
- You want to conditionally render content based on presence
- You need a simple, clean API

**Example:**
```tsx
const MyComponent = () => {
  const isPresent = useIsPresent();
  
  return (
    <animate.div>
      {isPresent && <div>Only show when present</div>}
      <p>Status: {isPresent ? 'Present' : 'Exiting'}</p>
    </animate.div>
  );
};
```

## `usePresence()` - Full Control

**Returns:** `[isPresent: boolean, onExitComplete: () => void]`

**Use when:**
- You need to manually control when exit animation completes
- You're implementing custom exit logic (e.g., async operations)
- You need both the boolean state AND the completion callback
- You're building reusable components that need presence control

**Example:**
```tsx
const MyComponent = () => {
  const [isPresent, onExitComplete] = usePresence();
  
  useEffect(() => {
    if (!isPresent) {
      // Custom exit logic - e.g., wait for async operation
      someAsyncOperation().then(() => {
        onExitComplete(); // Manually complete exit
      });
    }
  }, [isPresent, onExitComplete]);
  
  return <animate.div>...</animate.div>;
};
```

## Key Differences

| Feature | `useIsPresent()` | `usePresence()` |
|---------|------------------|-----------------|
| Return type | `boolean` | `[boolean, () => void]` |
| Use case | Simple conditional rendering | Manual exit control |
| Exit completion | Automatic | Manual (via callback) |
| Complexity | Simple | More control |

## When NOT to Use

- **Outside `<Presence>`**: Both hooks return safe defaults (always present), but they won't track exit animations
- **For simple exit animations**: If you're just using the `exit` prop on `animate.div`, you don't need these hooks - the exit animations work automatically

## Common Patterns

### Pattern 1: Conditional Content
```tsx
// ✅ Use useIsPresent for simple cases
const isPresent = useIsPresent();
{isPresent && <ExpensiveComponent />}
```

### Pattern 2: Custom Exit Logic
```tsx
// ✅ Use usePresence when you need manual control
const [isPresent, onExitComplete] = usePresence();
useEffect(() => {
  if (!isPresent) {
    // Wait for something before completing exit
    setTimeout(onExitComplete, 1000);
  }
}, [isPresent, onExitComplete]);
```

### Pattern 3: Nested Components
```tsx
// ✅ Both hooks work in nested components
<Presence>
  <OuterComponent>
    <InnerComponent>
      {/* Can use usePresence or useIsPresent here */}
    </InnerComponent>
  </OuterComponent>
</Presence>
```

