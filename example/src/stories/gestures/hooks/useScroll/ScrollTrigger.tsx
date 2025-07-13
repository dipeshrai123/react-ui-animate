import { useScroll, animate } from 'react-ui-animate';

export default function IntersectionExample() {
  const { scrollYProgress } = useScroll(window);

  return (
    <div
      style={{
        height: '200vh',
      }}
    >
      <animate.div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          backgroundColor: 'red',
          scale: scrollYProgress.to([0, 1], [1, 0.8]),
          rotate: scrollYProgress.to([0, 1], [0, -5]),
        }}
      />
      <animate.div
        style={{
          height: '100vh',
          backgroundColor: '#3399ff',
          position: 'relative',
          scale: scrollYProgress.to([0, 1], [0.8, 1]),
          rotate: scrollYProgress.to([0, 1], [-5, 0]),
        }}
      />
    </div>
  );
}
