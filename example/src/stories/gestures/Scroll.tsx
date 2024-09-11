import {
  useScroll,
  useValue,
  interpolate,
  animate,
  useValues,
} from 'react-ui-animate';

export const Scroll = () => {
  const x = useValue(100);
  const color = useValue('yellow');
  const position = useValue('fixed');
  const bind = useScroll(function (event) {
    x.value = interpolate(event.scrollY, [0, 200], [100, 300], {
      extrapolate: 'clamp',
    });

    if (event.scrollY > 100) {
      position.value = 'absolute';
      color.value = 'red';
    } else {
      position.value = 'fixed';
      color.value = 'yellow';
    }
  });

  return (
    <>
      <div
        {...bind()}
        style={{
          width: 500,
          height: 500,
          overflowY: 'auto',
          backgroundColor: '#3399ff',
          position: 'relative',
        }}
      >
        <animate.div
          onClick={() => (color.value = 'red')}
          style={{
            width: 100,
            height: 100,
            backgroundColor: color.value,
            top: 100,
            left: x.value,
            position: position.value,
          }}
        />
        <div style={{ height: 2000 }} />
      </div>
    </>
  );
};
