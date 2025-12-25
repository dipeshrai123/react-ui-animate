import { Children, useLayoutEffect, useState } from 'react';
import {
  useScroll,
  animate,
  useValue,
  withSequence,
  withDelay,
  withSpring,
} from 'react-ui-animate';
import { ExampleLayout } from '../animations/shared';

const StaggerItem = ({
  y,
  index,
  content,
}: {
  y: number;
  index: number;
  content: string;
}) => {
  const [top, setTop] = useValue(0);

  useLayoutEffect(() => {
    setTop(withSequence([withDelay(index * 50), withSpring(y)]));
  }, [y, index, setTop]);

  return (
    <animate.span
      style={{
        display: 'inline-block',
        border: '2px solid #3399ff',
        backgroundColor: '#f0f9ff',
        padding: '16px 20px',
        borderRadius: 8,
        translateY: top,
        fontSize: 32,
        fontWeight: 600,
        color: '#1a1a1a',
        boxShadow: '0 2px 8px rgba(51, 153, 255, 0.2)',
        marginRight: 8,
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

function Example() {
  const [y, setY] = useState(0);

  useScroll(window, ({ offset }) => {
    setY(offset.y);
  });

  return (
    <ExampleLayout
      title="Staggered Scroll Animation"
      description="Words animate with a staggered delay based on scroll position. Each word has a different delay creating a wave effect."
      onRestart={() => setY(0)}
      showRestartButton={false}
    >
      <div
        style={{
          height: '180vh',
        }}
      >
        <div
          style={{
            position: 'fixed',
            left: 40,
            top: 40,
            zIndex: 10,
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
    </ExampleLayout>
  );
}

export default Example;
