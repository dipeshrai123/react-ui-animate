import React from 'react';
import { animate, withSpring, withTiming, withDelay, withSequence } from 'react-ui-animate';

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

const FeatureCard: React.FC<{ feature: Feature; index: number }> = ({
  feature,
  index,
}) => {
  return (
    <animate.div
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
      view={{
        scale: withSpring(1, { stiffness: 200, damping: 20 }),
        opacity: withTiming(1, { duration: 600 }),
        translateY: withSpring(0, { stiffness: 200, damping: 20 }),
        rotate: withSpring(0, { stiffness: 200, damping: 20 }),
      }}
      viewOptions={{ threshold: 0.3, once: true }}
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
          scale: 0,
          rotate: 180,
        }}
        view={{
          scale: withSpring(1, { stiffness: 300, damping: 20 }),
          rotate: withSpring(0, { stiffness: 200, damping: 15 }),
        }}
        viewOptions={{ threshold: 0.3, once: true }}
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
  return (
    <animate.div
      style={{
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 32,
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        scale: 0,
        opacity: 0,
      }}
      view={{
        scale: withSpring(1, { stiffness: 200, damping: 20 }),
        opacity: withTiming(1, { duration: 400 }),
      }}
      viewOptions={{ threshold: 0.5, once: true }}
    >
      <animate.div
        style={{
          fontSize: 48,
          fontWeight: 700,
          color: '#3399ff',
          marginBottom: 8,
          scale: 0,
        }}
        view={{
          scale: withSpring(1, { stiffness: 300, damping: 15 }),
        }}
        viewOptions={{ threshold: 0.5, once: true }}
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
  return (
    <animate.h2
      style={{
        fontSize: 48,
        fontWeight: 700,
        color: '#1a1a1a',
        margin: 0,
        opacity: 0,
        translateY: 50,
      }}
      view={{
        opacity: withTiming(1, { duration: 800 }),
        translateY: withSpring(0, { stiffness: 200, damping: 20 }),
      }}
      viewOptions={{ threshold: 0.5, once: true }}
    >
      {text}
    </animate.h2>
  );
};

const Example: React.FC = () => {
  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* View with Delay Example Section */}
      <div
        style={{
          padding: '80px 40px',
          backgroundColor: '#f5f5f5',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <TextReveal text="View with Delay" />
          <p
            style={{
              marginTop: 16,
              marginBottom: 48,
              fontSize: 18,
              color: '#666',
              textAlign: 'center',
            }}
          >
            Element with opacity 0 that fades in after 2000ms delay when in view
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 300,
            }}
          >
            <animate.div
              style={{
                width: 200,
                height: 200,
                backgroundColor: '#3399ff',
                borderRadius: 16,
                opacity: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 18,
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
              view={{
                opacity: withSequence([
                  withDelay(2000),
                  withTiming(1, { duration: 500 }),
                ]),
              }}
              viewOptions={{ threshold: 0.5, once: true }}
            >
              Delayed Fade In
            </animate.div>
          </div>
        </div>
      </div>

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
          Elements animate smoothly as they enter the viewport using the view
          prop
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
