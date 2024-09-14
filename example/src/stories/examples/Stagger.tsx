import { Children, useState } from 'react';
import { useValue, useScroll, animate } from 'react-ui-animate';

const StaggerItem = ({ y, index }: any) => {
  const left = useValue(y, { delay: index * 50 });

  return (
    <animate.div
      style={{
        width: 100,
        height: 100,
        backgroundColor: 'red',
        border: '1px solid black',
        translateX: left.value,
      }}
    />
  );
};

const Stagger = ({ y, children }: any) => {
  const childs = Children.toArray(children);

  return (
    <>
      {childs.map((_, i) => (
        <StaggerItem y={y} key={i} index={i} />
      ))}
    </>
  );
};

export default function App() {
  const [y, setY] = useState(0);

  useScroll(({ scrollY }) => {
    setY(scrollY);
  });

  return (
    <div
      style={{
        height: 5000,
      }}
    >
      <div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
        }}
      >
        <Stagger y={y}>
          <span>Dipesh</span>
          <span>Rai</span>
        </Stagger>
      </div>
    </div>
  );
}
