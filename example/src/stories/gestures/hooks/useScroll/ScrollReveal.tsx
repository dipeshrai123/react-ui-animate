import { useRef } from 'react';
import {
  animate,
  useScroll,
  useValue,
  withSpring,
  withTiming,
} from 'react-ui-animate';

/**
 * Real-world example: Scroll Reveal Animations
 *
 * This demonstrates useScroll for creating scroll-triggered animations:
 * - Elements animate in as you scroll
 * - Smooth reveal effects
 * - Performance-optimized scroll handling
 */
const Example = () => {
  const section1Ref = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);
  const section3Ref = useRef<HTMLDivElement>(null);

  const [section1Opacity, setSection1Opacity] = useValue(0);
  const [section1Y, setSection1Y] = useValue(50);
  const [section2Opacity, setSection2Opacity] = useValue(0);
  const [section2Scale, setSection2Scale] = useValue(0.8);
  const [section3Opacity, setSection3Opacity] = useValue(0);
  const [section3Rotate, setSection3Rotate] = useValue(-10);

  useScroll(window, ({ offset }) => {
    // Section 1: Fade in from bottom
    if (section1Ref.current) {
      const rect = section1Ref.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const progress = Math.max(
        0,
        Math.min(1, (viewportHeight - rect.top) / viewportHeight)
      );

      setSection1Opacity(withTiming(progress, { duration: 300 }));
      setSection1Y(
        withSpring(50 * (1 - progress), { stiffness: 200, damping: 20 })
      );
    }

    // Section 2: Scale in
    if (section2Ref.current) {
      const rect = section2Ref.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const progress = Math.max(
        0,
        Math.min(1, (viewportHeight - rect.top) / viewportHeight)
      );

      setSection2Opacity(withTiming(progress, { duration: 300 }));
      setSection2Scale(
        withSpring(0.8 + progress * 0.2, { stiffness: 200, damping: 20 })
      );
    }

    // Section 3: Rotate in
    if (section3Ref.current) {
      const rect = section3Ref.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const progress = Math.max(
        0,
        Math.min(1, (viewportHeight - rect.top) / viewportHeight)
      );

      setSection3Opacity(withTiming(progress, { duration: 300 }));
      setSection3Rotate(
        withSpring(-10 + progress * 10, { stiffness: 200, damping: 20 })
      );
    }
  });

  const Section = ({
    sectionRef,
    title,
    description,
    emoji,
    opacity,
    translateY,
    scale,
    rotate,
  }: {
    sectionRef: React.RefObject<HTMLDivElement>;
    title: string;
    description: string;
    emoji: string;
    opacity: any;
    translateY?: any;
    scale?: any;
    rotate?: any;
  }) => (
    <animate.div
      ref={sectionRef}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        opacity,
        translateY,
        scale,
        rotate,
      }}
    >
      <div style={{ fontSize: 64, marginBottom: 24 }}>{emoji}</div>
      <h2
        style={{
          fontSize: 48,
          fontWeight: 700,
          marginBottom: 16,
          color: '#333',
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontSize: 18,
          color: '#666',
          maxWidth: 600,
          textAlign: 'center',
        }}
      >
        {description}
      </p>
    </animate.div>
  );

  return (
    <div style={{ backgroundColor: '#f8f9fa' }}>
      <Section
        sectionRef={section1Ref}
        title="Fade In"
        description="This section fades in and slides up as you scroll"
        emoji="✨"
        opacity={section1Opacity}
        translateY={section1Y}
      />

      <Section
        sectionRef={section2Ref}
        title="Scale In"
        description="This section scales in as it enters the viewport"
        emoji="🎯"
        opacity={section2Opacity}
        scale={section2Scale}
      />

      <Section
        sectionRef={section3Ref}
        title="Rotate In"
        description="This section rotates into view with a smooth animation"
        emoji="🌀"
        opacity={section3Opacity}
        rotate={section3Rotate}
      />
    </div>
  );
};

export default Example;
