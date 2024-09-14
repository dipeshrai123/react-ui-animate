import { Children, useState } from 'react';
import { useValue, useScroll, animate, interpolate } from 'react-ui-animate';

const StaggerItem = ({
  y,
  index,
  content,
}: {
  y: number;
  index: number;
  content: string;
}) => {
  const val = interpolate(y, [0, 500], [0, window.innerHeight - 50], {
    extrapolate: 'clamp',
  });
  const top = useValue(val, { delay: index * 50 });

  return (
    <animate.span
      style={{
        display: 'inline-block',
        border: '1px solid black',
        translateY: top.value,
        fontSize: 40,
      }}
    >
      {content}
    </animate.span>
  );
};

const Stagger = ({ y, children }: any) => {
  const childs = Children.toArray(children);

  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {childs.map((child: any, i) => (
        <StaggerItem y={y} key={i} index={i} content={child.props.children} />
      ))}
    </div>
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
          <span>Hello 👋</span>
          <span>I'm</span>
          <span>Dipesh</span>
          <span>Rai</span>
          <span>Welcome</span>
        </Stagger>
      </div>
    </div>
  );
}
