import {
  useValue,
  animate,
  withSpring,
  withTiming,
  withConfig,
  AnimationConfig,
  withSequence,
} from 'react-ui-animate';

export const ArrayValues = () => {
  // const translateX = useValue([0, 100, 200]);
  //
  // const animateLeft = () => {
  //   translateX.value = [
  //     withSpring(0),
  //     withTiming(0),
  //     withSequence([
  //       withSpring(200),
  //       withTiming(100, { duration: 3000 }),
  //       withConfig(0, AnimationConfig.WOOBLE),
  //     ]),
  //   ];
  // };
  //
  // const animateRight = () => {
  //   translateX.value = [100, 200, 300];
  // };
  //
  // return (
  //   <>
  //     <button onClick={animateLeft}>ANIMATE LEFT</button>
  //     <button onClick={animateRight}>ANIMATE RIGHT</button>
  //     {translateX.value.map((t, i) => (
  //       <animate.div
  //         key={i}
  //         style={{
  //           width: 100,
  //           height: 100,
  //           backgroundColor: '#3399ff',
  //           translateX: t,
  //         }}
  //       />
  //     ))}
  //   </>
  // );

  return <div>Animation Array ( TODO )</div>;
};
