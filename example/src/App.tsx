import {
  // Draggable,
  // Gestures,
  // Interpolation,
  // Loop,
  // Mounted,
  // MouseMove,
  // MultistageTransition,
  // Scroll,
  // SCBlock,
  // SnapTo,
  // SVGLine,
  // TBExample,
  // UseAnimatedValue,
  UseMountedValue,
  // Wheel,
} from './components';

function App() {
  return (
    <div style={{ width: '80%', margin: '20px auto' }}>
      {/* <Draggable />
      <Gestures />
      <Interpolation />
      <Loop />
      <Mounted />
      <MouseMove />
      <MultistageTransition />
      <Scroll />
      <SCBlock />
      <SnapTo />
      <SVGLine />
      <TBExample /> */}
      <UseMountedValue />
      {/* <UseMountedValue />
      <Wheel />
      <UseMountedValue /> */}
    </div>
  );
}

export default App;