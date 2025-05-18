import { useValues, animate } from 'react-ui-animate';

export const ArrayStrings = () => {
  const translateX = useValues(['red', 'blue', 'green']);

  const animateLeft = () => {
    translateX.value = ['red', 'blue', 'green'];
  };

  const animateRight = () => {
    translateX.value = ['green', 'red', 'blue'];
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
