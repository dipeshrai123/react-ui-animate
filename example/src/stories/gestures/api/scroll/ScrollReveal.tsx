import { useRef } from 'react';
import { animate, useScrollReveal, type AnimateValue } from 'react-ui-animate';

const Section = ({
  title,
  description,
  emoji,
  transform,
}: {
  title: string;
  description: string;
  emoji: string;
  transform: (progress: AnimateValue<number>) => Record<string, any>;
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  // Complete the reveal as soon as the section fully fills the viewport
  // (its top reaching the viewport's top), rather than the default full
  // enter-to-exit transit — otherwise a 100vh section is only ~halfway
  // animated by the time it's fully visible.
  const { progress } = useScrollReveal(sectionRef, {
    offset: ['start end', 'start start'],
  });

  return (
    <animate.div
      ref={sectionRef}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        opacity: progress.to([0, 1], [0, 1]),
        ...transform(progress),
      }}
    >
      <div style={{ fontSize: 64, marginBottom: 24 }}>{emoji}</div>
      <h2 style={{ fontSize: 48, fontWeight: 700, marginBottom: 16, color: '#f4f4f6' }}>
        {title}
      </h2>
      <p style={{ fontSize: 18, color: '#9a9aa4', maxWidth: 600, textAlign: 'center' }}>
        {description}
      </p>
    </animate.div>
  );
};

const Example = () => {
  return (
    <div style={{ backgroundColor: '#0a0a0d' }}>
      <Section
        title="Fade In"
        description="This section fades in and slides up as you scroll — driven entirely by useScrollReveal, no manual gesture wiring."
        emoji="✨"
        transform={(progress) => ({
          translateY: progress.to([0, 1], [50, 0]),
        })}
      />

      <Section
        title="Scale In"
        description="This section scales in as it enters the viewport."
        emoji="🎯"
        transform={(progress) => ({
          scale: progress.to([0, 1], [0.8, 1]),
        })}
      />

      <Section
        title="Rotate In"
        description="This section rotates into view with a smooth animation."
        emoji="🌀"
        transform={(progress) => ({
          rotate: progress.to([0, 1], [-10, 0]),
        })}
      />
    </div>
  );
};

export default Example;
