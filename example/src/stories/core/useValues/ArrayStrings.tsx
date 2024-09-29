import { useValues, animate, withString } from 'react-ui-animate';

export const ArrayStrings = () => {
  const translateX = useValues(['red', 'blue', 'green']);

  const animateLeft = () => {
    translateX.value = [
      withString('red'),
      withString('blue'),
      withString('green'),
    ];
  };

  const animateRight = () => {
    translateX.value = [
      withString('green'),
      withString('red'),
      withString('blue'),
    ];
  };

  return (
    <>
      <button onClick={animateLeft}>ANIMATE LEFT</button>
      <button onClick={animateRight}>ANIMATE RIGHT</button>
      {translateX.value.map((t, i) => (
        <animate.div
          key={i}
          style={{
            width: 100,
            height: 100,
            backgroundColor: t,
            translateX: i * 100,
            transition: 'background-color 1s',
          }}
        />
      ))}
    </>
  );
};
