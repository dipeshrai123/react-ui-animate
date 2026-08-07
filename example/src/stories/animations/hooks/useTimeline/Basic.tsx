import { animate, useTimeline, useValue, withSpring, withTiming } from 'react-ui-animate';
import { ExampleLayout, ExampleCard, Button } from '../../shared';

const STEPS = [
  { label: 'Auth', color: '#3399ff' },
  { label: 'Fetch', color: '#f5576c' },
  { label: 'Render', color: '#00c896' },
];

const Example = () => {
  const [opacity1, setOpacity1] = useValue(0);
  const [opacity2, setOpacity2] = useValue(0);
  const [opacity3, setOpacity3] = useValue(0);
  const [scale1, setScale1] = useValue(0.6);
  const [scale2, setScale2] = useValue(0.6);
  const [scale3, setScale3] = useValue(0.6);

  const timeline = useTimeline();

  const play = () => {
    setOpacity1(0);
    setOpacity2(0);
    setOpacity3(0);
    setScale1(0.6);
    setScale2(0.6);
    setScale3(0.6);

    timeline
      .add(setOpacity1, withTiming(1, { duration: 300 }), { at: 0 })
      .add(setScale1, withSpring(1), { at: 0 })
      .add(setOpacity2, withTiming(1, { duration: 300 }), { at: 400 })
      .add(setScale2, withSpring(1), { at: 400 })
      .add(setOpacity3, withTiming(1, { duration: 300 }), { at: 800 })
      .add(setScale3, withSpring(1), { at: 800 })
      .play();
  };

  const boxes = [
    { opacity: opacity1, scale: scale1 },
    { opacity: opacity2, scale: scale2 },
    { opacity: opacity3, scale: scale3 },
  ];

  return (
    <ExampleLayout
      tag="HOOK"
      title="useTimeline"
      description={
        <>
          Orchestrates independently-owned <code>useValue</code> pairs — one per step — on a
          shared millisecond schedule, the way <code>withSequence</code> orchestrates values
          within a single call.
        </>
      }
      showRestartButton={false}
    >
      <ExampleCard>
        <div style={{ marginBottom: 24 }}>
          <Button variant="primary" onClick={play}>
            Play sequence
          </Button>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {STEPS.map((step, i) => (
            <animate.div
              key={step.label}
              style={{
                width: 140,
                height: 100,
                borderRadius: 12,
                backgroundColor: step.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 600,
                opacity: boxes[i].opacity,
                scale: boxes[i].scale,
              }}
            >
              {step.label}
            </animate.div>
          ))}
        </div>
      </ExampleCard>
    </ExampleLayout>
  );
};

export default Example;
