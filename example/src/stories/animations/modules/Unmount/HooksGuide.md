# useUnmount vs useIsUnmounting: When to Use Each

## Overview

Both hooks provide access to unmount state when components are inside an `<Unmount>` component. They help you react to enter/unmount animations.

## `useIsUnmounting()` - Simple Boolean Check

**Returns:** `boolean`

**Use when:**
- You only need to know if the component is unmounting (not present)
- You want to conditionally render content based on presence
- You need a simple, clean API

**Example:**
```tsx
const MyComponent = () => {
  const isUnmounting = useIsUnmounting();
  
  return (
    <animate.div>
      {!isUnmounting && <div>Only show when present</div>}
      <p>Status: {isUnmounting ? 'Exiting' : 'Present'}</p>
    </animate.div>
  );
};
```

## `useUnmount()` - Full Control

**Returns:** `[isPresent: boolean, onExitComplete: () => void]`

**Use when:**
- You need to manually control when the unmount animation completes
- You're implementing custom unmount logic (e.g., async operations)
- You need both the boolean state AND the completion callback
- You're building reusable components that need unmount control

**Example:**
```tsx
const MyComponent = () => {
  const [isPresent, onExitComplete] = useUnmount();
  
  useEffect(() => {
    if (!isPresent) {
      // Custom unmount logic - e.g., wait for async operation
      someAsyncOperation().then(() => {
        onExitComplete(); // Manually complete unmount
      });
    }
  }, [isPresent, onExitComplete]);
  
  return <animate.div>...</animate.div>;
};
```

## Key Differences

| Feature | `useIsUnmounting()` | `useUnmount()` |
|---------|------------------|-----------------|
| Return type | `boolean` | `[boolean, () => void]` |
| Use case | Simple conditional rendering | Manual unmount control |
| Completion | Automatic | Manual (via callback) |
| Complexity | Simple | More control |

## When NOT to Use

- **Outside `<Unmount>`**: Both hooks return safe defaults (always present), but they won't track unmount animations
- **For simple unmount animations**: If you're just using the `unmount` prop on `animate.div`, you don't need these hooks - the unmount animations work automatically

## Common Patterns

### Pattern 1: Conditional Content
```tsx
// ✅ Use useIsUnmounting for simple cases
const isUnmounting = useIsUnmounting();
{!isUnmounting && <ExpensiveComponent />}
```

### Pattern 2: Custom Unmount Logic
```tsx
// ✅ Use useUnmount when you need manual control
const [isPresent, onExitComplete] = useUnmount();
useEffect(() => {
  if (!isPresent) {
    // Wait for something before completing unmount
    setTimeout(onExitComplete, 1000);
  }
}, [isPresent, onExitComplete]);
```

### Pattern 3: Nested Components
```tsx
// ✅ Both hooks work in nested components
<Unmount>
  <OuterComponent>
    <InnerComponent>
      {/* Can use useUnmount or useIsUnmounting here */}
    </InnerComponent>
  </OuterComponent>
</Unmount>
```
