import {
  useAnimatedValue,
  useDrag,
  AnimationConfigUtils,
  fluid,
} from 'react-ui-animate';

export function SVGLine() {
  const dragX = useAnimatedValue(0, { immediate: true });
  const followX = useAnimatedValue(0, AnimationConfigUtils.ELASTIC);

  const circleBind = useDrag(({ movementX }) => {
    dragX.value = movementX;
    followX.value = movementX;
  });

  return (
    <div className='App'>
      <svg
        style={{
          border: '1px solid #3399ff',
        }}
        width={200}
        height={200}
        xmlns='http://www.w3.org/2000/svg'
      >
        <fluid.line
          x1={followX.value}
          y1='10'
          x2={dragX.value}
          y2='50'
          stroke='black'
        />
        <fluid.circle cx={followX.value} cy='10' r='2' fill='red' />
        <fluid.circle
          {...circleBind()}
          style={{
            cursor: 'pointer',
          }}
          cx={dragX.value}
          cy='50'
          r='5'
          fill='red'
        />
      </svg>
    </div>
  );
}
