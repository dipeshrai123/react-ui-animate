import React, { useRef, useState, useEffect } from 'react';
import { animate, withSpring, withTiming, useInView } from 'react-ui-animate';

interface Feature {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const features: Feature[] = [
  {
    id: 1,
    title: 'Scroll Animations',
    description: 'Elements animate smoothly as they enter the viewport',
    icon: '📜',
    color: '#3399ff',
  },
  {
    id: 2,
    title: 'Performance',
    description: 'Optimized animations that run at 60fps',
    icon: '⚡',
    color: '#51cf66',
  },
  {
    id: 3,
    title: 'Easy to Use',
    description: 'Simple API that makes animations effortless',
    icon: '✨',
    color: '#ffd43b',
  },
  {
    id: 4,
    title: 'Flexible',
    description: 'Works with any animation type and configuration',
    icon: '🎨',
    color: '#ff6b6b',
  },
];

// Custom hook to track scroll direction
const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState<'down' | 'up'>('down');
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY.current) {
        setScrollDirection('up');
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollDirection;
};

const FeatureCard: React.FC<{ feature: Feature; index: number }> = ({
  feature,
  index,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { threshold: 0.3 });
  const scrollDirection = useScrollDirection();
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (inView && scrollDirection === 'down' && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [inView, scrollDirection, hasAnimated]);

  const shouldAnimate = hasAnimated || (inView && scrollDirection === 'down');

  return (
    <animate.div
      ref={ref}
      style={{
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 32,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        scale: 0.8,
        opacity: 0,
        translateY: 100,
        rotate: -10,
      }}
      animate={{
        scale: shouldAnimate
          ? withSpring(1, { stiffness: 200, damping: 20 })
          : 0.8,
        opacity: shouldAnimate ? withTiming(1, { duration: 600 }) : 0,
        translateY: shouldAnimate
          ? withSpring(0, { stiffness: 200, damping: 20 })
          : 100,
        rotate: shouldAnimate
          ? withSpring(0, { stiffness: 200, damping: 20 })
          : -10,
      }}
    >
      <animate.div
        style={{
          width: 80,
          height: 80,
          borderRadius: 20,
          backgroundColor: `${feature.color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 40,
          marginBottom: 24,
          scale: shouldAnimate ? 1 : 0,
          rotate: shouldAnimate ? 0 : 180,
        }}
        animate={{
          scale: shouldAnimate
            ? withSpring(1, { stiffness: 300, damping: 20 })
            : withSpring(0, { stiffness: 300, damping: 20 }),
          rotate: shouldAnimate
            ? withSpring(0, { stiffness: 200, damping: 15 })
            : withSpring(180, { stiffness: 200, damping: 15 }),
        }}
      >
        {feature.icon}
      </animate.div>
      <h3
        style={{
          margin: 0,
          marginBottom: 12,
          fontSize: 24,
          fontWeight: 700,
          color: '#1a1a1a',
        }}
      >
        {feature.title}
      </h3>
      <p
        style={{
          margin: 0,
          fontSize: 16,
          color: '#666',
          lineHeight: 1.6,
        }}
      >
        {feature.description}
      </p>
    </animate.div>
  );
};

const StatCard: React.FC<{ value: number; label: string; delay?: number }> = ({
  value,
  label,
  delay = 0,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { threshold: 0.5 });
  const scrollDirection = useScrollDirection();
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (inView && scrollDirection === 'down' && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [inView, scrollDirection, hasAnimated]);

  const shouldAnimate = hasAnimated || (inView && scrollDirection === 'down');

  return (
    <animate.div
      ref={ref}
      style={{
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 32,
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        scale: 0,
        opacity: 0,
      }}
      animate={{
        scale: shouldAnimate
          ? withSpring(1, { stiffness: 200, damping: 20 })
          : withSpring(0, { stiffness: 200, damping: 20 }),
        opacity: shouldAnimate ? withTiming(1, { duration: 400 }) : 0,
      }}
    >
      <animate.div
        style={{
          fontSize: 48,
          fontWeight: 700,
          color: '#3399ff',
          marginBottom: 8,
          scale: shouldAnimate ? 1 : 0,
        }}
        animate={{
          scale: shouldAnimate
            ? withSpring(1, { stiffness: 300, damping: 15 })
            : withSpring(0, { stiffness: 300, damping: 15 }),
        }}
      >
        {value}+
      </animate.div>
      <div
        style={{
          fontSize: 16,
          color: '#666',
          fontWeight: 500,
        }}
      >
        {label}
      </div>
    </animate.div>
  );
};

const TextReveal: React.FC<{ text: string; delay?: number }> = ({
  text,
  delay = 0,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { threshold: 0.5 });
  const scrollDirection = useScrollDirection();
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (inView && scrollDirection === 'down' && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [inView, scrollDirection, hasAnimated]);

  const shouldAnimate = hasAnimated || (inView && scrollDirection === 'down');

  return (
    <animate.h2
      ref={ref}
      style={{
        fontSize: 48,
        fontWeight: 700,
        color: '#1a1a1a',
        margin: 0,
        opacity: 0,
        translateY: 50,
      }}
      animate={{
        opacity: shouldAnimate ? withTiming(1, { duration: 800 }) : 0,
        translateY: shouldAnimate
          ? withSpring(0, { stiffness: 200, damping: 20 })
          : 50,
      }}
    >
      {text}
    </animate.h2>
  );
};

const Example: React.FC = () => {
  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Hero Section */}
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          padding: 40,
          textAlign: 'center',
        }}
      >
        <TextReveal text="Scroll to See Animations" />
        <p
          style={{
            marginTop: 24,
            fontSize: 20,
            color: '#666',
            maxWidth: 600,
          }}
        >
          Elements animate smoothly as they enter the viewport using useInView
        </p>
      </div>

      {/* Features Section */}
      <div style={{ padding: '80px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <TextReveal text="Features" />
        <p
          style={{
            marginTop: 16,
            marginBottom: 48,
            fontSize: 18,
            color: '#666',
            textAlign: 'center',
          }}
        >
          Scroll down to see each feature animate into view
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 32,
            marginBottom: 80,
          }}
        >
          {features.map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} index={index} />
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div
        style={{
          padding: '80px 40px',
          backgroundColor: 'white',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <TextReveal text="Statistics" />
          <p
            style={{
              marginTop: 16,
              marginBottom: 48,
              fontSize: 18,
              color: '#666',
              textAlign: 'center',
            }}
          >
            Numbers that count up when in view
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 24,
            }}
          >
            <StatCard value={1000} label="Happy Users" />
            <StatCard value={50} label="Countries" />
            <StatCard value={99} label="Uptime %" />
            <StatCard value={24} label="Support Hours" />
          </div>
        </div>
      </div>

      {/* Final Section */}
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
        }}
      >
        <animate.div
          style={{
            textAlign: 'center',
            maxWidth: 600,
            opacity: 0,
            scale: 0.8,
          }}
          animate={{
            opacity: withTiming(1, { duration: 1000 }),
            scale: withSpring(1, { stiffness: 200, damping: 20 }),
          }}
        >
          <h2
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: '#1a1a1a',
              marginBottom: 16,
            }}
          >
            Ready to Get Started?
          </h2>
          <p
            style={{
              fontSize: 18,
              color: '#666',
              marginBottom: 32,
            }}
          >
            Start building beautiful scroll animations today
          </p>
          <animate.button
            style={{
              padding: '16px 32px',
              fontSize: 16,
              fontWeight: 600,
              backgroundColor: '#3399ff',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              cursor: 'pointer',
              scale: 1,
            }}
            hover={{
              scale: withSpring(1.05, { stiffness: 300, damping: 20 }),
            }}
            press={{
              scale: withSpring(0.95, { stiffness: 400, damping: 25 }),
            }}
          >
            Get Started
          </animate.button>
        </animate.div>
      </div>
    </div>
  );
};

export default Example;
