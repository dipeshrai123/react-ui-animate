import { useState } from 'react';
import { animate, useValue, withTiming } from 'react-ui-animate';
import { ExampleLayout, Section, ExampleCard } from '../shared';

const RADIUS = 70;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const SQUARE_PATH = 'M 40 40 L 160 40 L 160 160 L 40 160 Z';
const DIAMOND_PATH = 'M 100 20 L 180 100 L 100 180 L 20 100 Z';

function Example() {
  const [trigger, setTrigger] = useState(0);
  const [dashoffset, setDashoffset] = useValue(CIRCUMFERENCE);
  const [path, setPath] = useValue(SQUARE_PATH);
  const [isDiamond, setIsDiamond] = useState(false);

  const draw = () => {
    setDashoffset(CIRCUMFERENCE);
    setDashoffset(withTiming(0, { duration: 900 }));
  };

  const toggleMorph = () => {
    setPath(withTiming(isDiamond ? SQUARE_PATH : DIAMOND_PATH, { duration: 500 }));
    setIsDiamond(!isDiamond);
  };

  return (
    <ExampleLayout
      title="SVG Path Animation"
      description="Two techniques that work today with no extra library support: a stroke-draw effect (animating strokeDashoffset, a plain unitless number) and same-topology path morphing (animating d between two path strings with the same number of points)."
      onRestart={() => setTrigger((prev) => prev + 1)}
    >
      <Section
        title="Stroke Draw"
        description="strokeDasharray is set to the circle's circumference; strokeDashoffset animates from the full circumference down to 0, revealing the stroke as if it were being drawn."
      >
        <ExampleCard>
          <svg width={200} height={200} viewBox="0 0 200 200">
            <circle
              cx={100}
              cy={100}
              r={RADIUS}
              fill="none"
              stroke="#e0e0e0"
              strokeWidth={8}
            />
            <animate.circle
              key={trigger}
              cx={100}
              cy={100}
              r={RADIUS}
              fill="none"
              stroke="#3399ff"
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashoffset}
              transform="rotate(-90 100 100)"
            />
          </svg>
          <div>
            <button
              onClick={draw}
              style={{
                padding: '8px 16px',
                fontSize: 14,
                backgroundColor: '#3399ff',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              Draw
            </button>
          </div>
        </ExampleCard>
      </Section>

      <Section
        title="Path Morph (Same Topology)"
        description="Square <-> diamond, each defined with exactly 4 points (8 numbers) — the generic string interpolation used by withTiming/withSpring maps each number across, so this morphs cleanly. It only works when both paths have the same token structure; a differently-shaped path (a different number of points) won't morph correctly with this technique."
      >
        <ExampleCard>
          <svg width={200} height={200} viewBox="0 0 200 200">
            <animate.path
              d={path}
              fill="#845ef7"
              stroke="#5f3dc4"
              strokeWidth={2}
            />
          </svg>
          <div>
            <button
              onClick={toggleMorph}
              style={{
                padding: '8px 16px',
                fontSize: 14,
                backgroundColor: '#845ef7',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              Morph
            </button>
          </div>
        </ExampleCard>
      </Section>
    </ExampleLayout>
  );
}

export default Example;
