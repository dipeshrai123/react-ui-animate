import { Children, useLayoutEffect, useState } from 'react';
import {
  useValue,
  useScroll,
  animate,
  withSequence,
  withSpring,
  withDelay,
} from 'react-ui-animate';

const StaggerItem = ({
  y,
  index,
  content,
}: {
  y: number;
  index: number;
  content: string;
}) => {
  const top = useValue(0);

  useLayoutEffect(() => {
    top.value = withSequence([withDelay(index * 50), withSpring(y)]);
  }, [y, index, top]);

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
