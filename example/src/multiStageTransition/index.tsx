import {
  AnimatedBlock,
  useAnimatedValue,
  ValueType,
  AnimationConfigUtils,
} from 'react-ui-animate';

export const MultistageTransition = () => {
  const x = useAnimatedValue(0);

  return (
    <>
      <AnimatedBlock
        style={{
          width: 100,
          height: 100,
          backgroundColor: 'red',
          translateX: x.value,
        }}
      />

      <button
        onClick={() => {
          x.value = {
            toValue: 0,
            config: { ...AnimationConfigUtils.BOUNCE },
          } as ValueType;
        }}
      >
        ANIMATE LEFT
      </button>

      <button
        onClick={() => {
          x.value = (async (next) => {
            await next({ toValue: 50, config: { duration: 1000 } });
            await next({
              toValue: 500,
              config: { mass: 1, friction: 2, tension: 200 },
            });
          }) as ValueType;
        }}
      >
        ANIMATE RIGHT
      </button>
    </>
  );
};
