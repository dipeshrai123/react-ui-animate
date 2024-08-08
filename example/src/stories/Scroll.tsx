import { useScroll } from 'react-ui-animate';

export const Scroll = () => {
  const bind = useScroll(function (event) {
    console.log('SCROLL', event);
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
        }}
      >
        <div style={{ height: 2000 }} />
      </div>

      <div style={{ height: 2000 }} />

      {Array(5)
        .fill(null)
        .map((_, i) => (
          <div
            key={i}
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#3399ff',
              marginBottom: 10,
            }}
          />
        ))}
    </>
  );
};
