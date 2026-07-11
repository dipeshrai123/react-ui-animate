import React, { useRef } from 'react';
import {
  animate,
  useScroll,
  useValue,
  withDelay,
  withLoop,
  withSequence,
  withSpring,
  withTiming,
} from 'react-ui-animate';

const FEATURES = [
  {
    icon: '✨',
    title: 'Declarative API',
    description:
      'Animate any element with intuitive props — no imperative timelines required.',
    color: '#6366f1',
  },
  {
    icon: '🌊',
    title: 'Spring Physics',
    description:
      'Natural motion out of the box with configurable stiffness and damping.',
    color: '#8b5cf6',
  },
  {
    icon: '👆',
    title: 'Gesture Hooks',
    description:
      'Drag, scroll, move, and wheel — built-in hooks for interactive experiences.',
    color: '#ec4899',
  },
  {
    icon: '🎭',
    title: 'Presence',
    description:
      'Mount and unmount with exit animations. Lists feel alive, not abrupt.',
    color: '#14b8a6',
  },
  {
    icon: '⚡',
    title: '60fps Performance',
    description:
      'Runs on the compositor thread. Smooth even on lower-end devices.',
    color: '#f59e0b',
  },
  {
    icon: '🧩',
    title: 'Tree-shakeable',
    description:
      'Import only what you need. Lightweight bundle for production apps.',
    color: '#3b82f6',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'We replaced three animation libraries with react-ui-animate. The scroll hooks alone saved us weeks.',
    author: 'Elena Vasquez',
    role: 'Staff Engineer, Linear',
    avatar: 'EV',
    color: '#6366f1',
  },
  {
    quote:
      'The spring defaults feel incredible. Our landing page went from static to delightful in an afternoon.',
    author: 'James Okonkwo',
    role: 'Design Lead, Vercel',
    avatar: 'JO',
    color: '#8b5cf6',
  },
  {
    quote:
      'Presence + view animations made our dashboard transitions feel native. Developers love the API.',
    author: 'Priya Sharma',
    role: 'Frontend Architect, Stripe',
    avatar: 'PS',
    color: '#ec4899',
  },
];

const LOGOS = ['Acme', 'Nova', 'Orbit', 'Pulse', 'Zenith'];

const CODE_LINES: {
  text: string;
  dim?: boolean;
  highlight?: boolean;
}[] = [
  { text: "import { animate, useScroll, withSpring } from 'react-ui-animate';" },
  { text: '' },
  { text: 'function Hero() {' },
  { text: '  const ref = useRef(null);' },
  { text: '  const { scrollYProgress } = useScroll(window, {' },
  { text: '    target: ref,', dim: true },
  { text: "    offset: ['start start', 'end start'],", dim: true },
  { text: '  });' },
  { text: '' },
  { text: '  return (' },
  { text: '    <animate.div' },
  {
    text: '      style={{ opacity: scrollYProgress.to([0, 1], [1, 0]) }}',
    highlight: true,
  },
  { text: '    />' },
  { text: '  );' },
  { text: '}' },
];

function reveal(delay: number) {
  const fade = withTiming(1, { duration: 700 });
  const rise = withSpring(0, { stiffness: 120, damping: 22 });
  if (delay <= 0) return { opacity: fade, translateY: rise };
  return {
    opacity: withSequence([withDelay(delay), fade]),
    translateY: withSequence([withDelay(delay), rise]),
  };
}

function RevealSection({
  children,
  style,
  delay = 0,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  delay?: number;
}) {
  return (
    <div style={style}>
      <animate.div
        style={{
          opacity: 0,
          translateY: 48,
        }}
        view={reveal(delay)}
        viewOptions={{ threshold: 0.15, once: true }}
      >
        {children}
      </animate.div>
    </div>
  );
}

const Example = () => {
  const pageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const showcaseRef = useRef<HTMLElement>(null);

  const [navBg, setNavBg] = useValue('rgba(255,255,255,0)');
  const [navBlur, setNavBlur] = useValue(0);
  const [navHeight, setNavHeight] = useValue(72);
  const [navBorder, setNavBorder] = useValue('rgba(226,232,240,0)');

  const { scrollYProgress: pageProgress } = useScroll(window, {
    target: pageRef,
    offset: ['start start', 'end end'],
    animate: false,
  });

  const { scrollYProgress: heroProgress } = useScroll(window, {
    target: heroRef,
    offset: ['start start', 'end start'],
    animate: false,
  });

  const { scrollYProgress: showcaseProgress } = useScroll(window, {
    target: showcaseRef,
    offset: ['start end', 'end start'],
    animate: false,
  });

  useScroll(window, ({ offset }) => {
    const y = offset.y;
    if (y > 40) {
      setNavBg(withSpring('rgba(255,255,255,0.88)', { stiffness: 300, damping: 30 }));
      setNavBlur(withSpring(12, { stiffness: 300, damping: 30 }));
      setNavHeight(withSpring(60, { stiffness: 300, damping: 30 }));
      setNavBorder(withSpring('rgba(226,232,240,0.9)', { stiffness: 300, damping: 30 }));
    } else {
      setNavBg(withSpring('rgba(255,255,255,0)', { stiffness: 300, damping: 30 }));
      setNavBlur(withSpring(0, { stiffness: 300, damping: 30 }));
      setNavHeight(withSpring(72, { stiffness: 300, damping: 30 }));
      setNavBorder(withSpring('rgba(226,232,240,0)', { stiffness: 300, damping: 30 }));
    }
  });

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      ref={pageRef}
      style={{
        backgroundColor: '#fafafa',
        color: '#0f172a',
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Reading progress */}
      <animate.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: pageProgress.to([0, 1], ['0%', '100%']),
          height: 3,
          background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)',
          zIndex: 1100,
          borderRadius: '0 2px 2px 0',
        }}
      />

      {/* Nav */}
      <animate.nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          height: navHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 clamp(20px, 4vw, 48px)',
          backgroundColor: navBg,
          backdropFilter: navBlur.to([0, 12], ['blur(0px)', 'blur(12px)']),
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
          borderBottomColor: navBorder,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            ◆
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: -0.3 }}>
            react-ui-animate
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(16px, 3vw, 32px)',
          }}
        >
          {[
            { label: 'Features', id: 'features' },
            { label: 'Showcase', id: 'showcase' },
            { label: 'Testimonials', id: 'testimonials' },
          ].map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => scrollTo(link.id)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 14,
                fontWeight: 500,
                color: '#64748b',
                cursor: 'pointer',
                padding: '6px 0',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#6366f1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#64748b';
              }}
            >
              {link.label}
            </button>
          ))}
          <animate.button
            type="button"
            onClick={() => scrollTo('cta')}
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              border: 'none',
              background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              scale: 1,
            }}
            hover={{ scale: withSpring(1.04, { stiffness: 400, damping: 22 }) }}
            press={{ scale: withSpring(0.96, { stiffness: 500, damping: 28 }) }}
          >
            Get Started
          </animate.button>
        </div>
      </animate.nav>

      {/* Hero */}
      <header
        ref={heroRef}
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: '80px clamp(20px, 4vw, 48px) 60px',
        }}
      >
        {/* Parallax orbs */}
        <animate.div
          style={{
            position: 'absolute',
            top: '10%',
            left: '8%',
            width: 420,
            height: 420,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)',
            translateY: heroProgress.to([0, 1], [0, -120]),
            scale: heroProgress.to([0, 1], [1, 1.2]),
            opacity: heroProgress.to([0, 0.8, 1], [1, 0.6, 0]),
            pointerEvents: 'none',
          }}
        />
        <animate.div
          style={{
            position: 'absolute',
            bottom: '15%',
            right: '5%',
            width: 360,
            height: 360,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)',
            translateY: heroProgress.to([0, 1], [0, 80]),
            translateX: heroProgress.to([0, 1], [0, -40]),
            opacity: heroProgress.to([0, 0.8, 1], [1, 0.5, 0]),
            pointerEvents: 'none',
          }}
        />
        <animate.div
          style={{
            position: 'absolute',
            top: '40%',
            right: '20%',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(236,72,153,0.25) 0%, transparent 70%)',
            translateY: heroProgress.to([0, 1], [0, -200]),
            pointerEvents: 'none',
          }}
        />

        {/* Floating UI cards */}
        <animate.div
          style={{
            position: 'absolute',
            top: '22%',
            right: '12%',
            width: 180,
            padding: 16,
            borderRadius: 14,
            backgroundColor: 'rgba(255,255,255,0.85)',
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: 'rgba(226,232,240,0.8)',
            boxShadow: '0 20px 40px rgba(99,102,241,0.12)',
            translateY: heroProgress.to([0, 1], [0, -60]),
            rotate: heroProgress.to([0, 1], [3, -6]),
            opacity: heroProgress.to([0, 0.7, 1], [1, 0.8, 0]),
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: 11, color: '#6366f1', fontWeight: 600, marginBottom: 6 }}>
            SPRING
          </div>
          <div
            style={{
              height: 6,
              borderRadius: 3,
              background: 'linear-gradient(90deg, #6366f1, #a5b4fc)',
              width: '75%',
            }}
          />
        </animate.div>

        <animate.div
          style={{
            position: 'absolute',
            bottom: '28%',
            left: '10%',
            width: 160,
            padding: 14,
            borderRadius: 14,
            backgroundColor: 'rgba(255,255,255,0.85)',
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: 'rgba(226,232,240,0.8)',
            boxShadow: '0 16px 32px rgba(139,92,246,0.1)',
            translateY: heroProgress.to([0, 1], [0, 40]),
            rotate: heroProgress.to([0, 1], [-4, 8]),
            opacity: heroProgress.to([0, 0.7, 1], [1, 0.8, 0]),
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: 22, marginBottom: 4 }}>60fps</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>Compositor thread</div>
        </animate.div>

        {/* Hero content */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: 760,
            textAlign: 'center',
          }}
        >
          <animate.div
            style={{
              display: 'inline-block',
              padding: '6px 14px',
              borderRadius: 999,
              backgroundColor: 'rgba(99,102,241,0.1)',
              color: '#6366f1',
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 24,
              opacity: heroProgress.to([0, 0.4], [1, 0]),
              translateY: heroProgress.to([0, 1], [0, -20]),
            }}
          >
            Scroll-driven animations
          </animate.div>

          <animate.h1
            style={{
              margin: 0,
              fontSize: 'clamp(2.5rem, 6vw, 4.2rem)',
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: -1.5,
              opacity: heroProgress.to([0, 0.5], [1, 0]),
              translateY: heroProgress.to([0, 1], [0, -80]),
              scale: heroProgress.to([0, 1], [1, 0.92]),
            }}
          >
            Build interfaces that{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              move with purpose
            </span>
          </animate.h1>

          <animate.p
            style={{
              margin: '24px auto 36px',
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              lineHeight: 1.7,
              color: '#64748b',
              maxWidth: 560,
              opacity: heroProgress.to([0, 0.45], [1, 0]),
              translateY: heroProgress.to([0, 1], [0, -50]),
            }}
          >
            Parallax heroes, scroll progress, sticky navs, and reveal animations —
            all powered by react-ui-animate hooks and declarative components.
          </animate.p>

          <animate.div
            style={{
              display: 'flex',
              gap: 14,
              justifyContent: 'center',
              flexWrap: 'wrap',
              opacity: heroProgress.to([0, 0.4], [1, 0]),
              translateY: heroProgress.to([0, 1], [0, -30]),
            }}
          >
            <animate.button
              type="button"
              onClick={() => scrollTo('features')}
              style={{
                padding: '14px 28px',
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
                color: '#fff',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
                scale: 1,
              }}
              hover={{ scale: withSpring(1.04, { stiffness: 400, damping: 22 }) }}
              press={{ scale: withSpring(0.96, { stiffness: 500, damping: 28 }) }}
            >
              Explore Features
            </animate.button>
            <animate.button
              type="button"
              onClick={() => scrollTo('showcase')}
              style={{
                padding: '14px 28px',
                borderRadius: 12,
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: '#e2e8f0',
                backgroundColor: '#ffffff',
                color: '#334155',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                scale: 1,
              }}
              hover={{
                scale: withSpring(1.04, { stiffness: 400, damping: 22 }),
                borderColor: withTiming('#c7d2fe', { duration: 200 }),
              }}
              press={{ scale: withSpring(0.96, { stiffness: 500, damping: 28 }) }}
            >
              View Code
            </animate.button>
          </animate.div>
        </div>

        {/* Scroll indicator */}
        <animate.div
          style={{
            position: 'absolute',
            bottom: 32,
            left: '50%',
            translateX: '-50%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            opacity: heroProgress.to([0, 0.25], [1, 0]),
          }}
        >
          <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
            Scroll to explore
          </span>
          <animate.div
            style={{
              width: 24,
              height: 38,
              borderRadius: 12,
              borderWidth: 2,
              borderStyle: 'solid',
              borderColor: '#cbd5e1',
              display: 'flex',
              justifyContent: 'center',
              paddingTop: 8,
            }}
          >
            <animate.div
              style={{
                width: 4,
                height: 8,
                borderRadius: 2,
                backgroundColor: '#6366f1',
                translateY: 0,
              }}
              animate={{
                translateY: withLoop(
                  withSequence([
                    withTiming(6, { duration: 700 }),
                    withTiming(0, { duration: 700 }),
                  ])
                ),
              }}
            />
          </animate.div>
        </animate.div>
      </header>

      {/* Logos */}
      <section
        style={{
          padding: '48px clamp(20px, 4vw, 48px)',
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderStyle: 'solid',
          borderColor: '#e2e8f0',
          backgroundColor: '#fff',
        }}
      >
        <RevealSection>
          <p
            style={{
              textAlign: 'center',
              fontSize: 13,
              color: '#94a3b8',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: 1.2,
              marginBottom: 28,
            }}
          >
            Trusted by teams building polished products
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 'clamp(32px, 6vw, 64px)',
              flexWrap: 'wrap',
            }}
          >
            {LOGOS.map((logo, i) => (
              <animate.span
                key={logo}
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: '#cbd5e1',
                  letterSpacing: -0.5,
                  opacity: 0,
                  translateY: 16,
                }}
                view={reveal(i * 80)}
                viewOptions={{ threshold: 0.5, once: true }}
              >
                {logo}
              </animate.span>
            ))}
          </div>
        </RevealSection>
      </section>

      {/* Features */}
      <section
        id="features"
        style={{
          padding: '100px clamp(20px, 4vw, 48px)',
          maxWidth: 1140,
          margin: '0 auto',
        }}
      >
        <RevealSection style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2
            style={{
              margin: 0,
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              fontWeight: 800,
              letterSpacing: -0.8,
            }}
          >
            Everything you need to animate
          </h2>
          <p
            style={{
              margin: '16px auto 0',
              fontSize: 17,
              color: '#64748b',
              maxWidth: 520,
              lineHeight: 1.6,
            }}
          >
            From scroll-linked parallax to viewport reveals — compose rich
            experiences with a single library.
          </p>
        </RevealSection>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
          }}
        >
          {FEATURES.map((feature, i) => (
            <animate.div
              key={feature.title}
              style={{
                padding: 28,
                borderRadius: 16,
                backgroundColor: '#fff',
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: '#e2e8f0',
                boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
                opacity: 0,
                translateY: 40,
                scale: 0.96,
              }}
              view={{
                opacity: withSequence([
                  withDelay((i % 3) * 100),
                  withTiming(1, { duration: 600 }),
                ]),
                translateY: withSequence([
                  withDelay((i % 3) * 100),
                  withSpring(0, { stiffness: 140, damping: 22 }),
                ]),
                scale: withSequence([
                  withDelay((i % 3) * 100),
                  withSpring(1, { stiffness: 200, damping: 20 }),
                ]),
              }}
              viewOptions={{ threshold: 0.2, once: true }}
              hover={{
                translateY: withSpring(-4, { stiffness: 300, damping: 22 }),
                boxShadow: withTiming(
                  `0 12px 32px ${feature.color}18`,
                  { duration: 250 }
                ),
                borderColor: withTiming(`${feature.color}40`, { duration: 250 }),
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: `${feature.color}12`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  marginBottom: 18,
                }}
              >
                {feature.icon}
              </div>
              <h3
                style={{
                  margin: '0 0 8px',
                  fontSize: 17,
                  fontWeight: 700,
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: '#64748b',
                  lineHeight: 1.65,
                }}
              >
                {feature.description}
              </p>
            </animate.div>
          ))}
        </div>
      </section>

      {/* Code showcase */}
      <section
        id="showcase"
        ref={showcaseRef}
        style={{
          padding: '100px clamp(20px, 4vw, 48px)',
          background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <animate.div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at 30% 50%, rgba(99,102,241,0.15) 0%, transparent 60%)',
            translateX: showcaseProgress.to([0, 1], [-40, 40]),
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            maxWidth: 960,
            margin: '0 auto',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <RevealSection style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2
              style={{
                margin: 0,
                fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
                fontWeight: 800,
                color: '#f8fafc',
                letterSpacing: -0.6,
              }}
            >
              Scroll-linked by default
            </h2>
            <p
              style={{
                margin: '14px auto 0',
                fontSize: 16,
                color: '#94a3b8',
                maxWidth: 480,
                lineHeight: 1.6,
              }}
            >
              Map scroll progress directly to styles with{' '}
              <code
                style={{
                  backgroundColor: 'rgba(99,102,241,0.2)',
                  padding: '2px 6px',
                  borderRadius: 4,
                  fontSize: 14,
                }}
              >
                .to()
              </code>{' '}
              interpolation — no manual RAF loops.
            </p>
          </RevealSection>

          <animate.div
            style={{
              borderRadius: 16,
              overflow: 'hidden',
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: 'rgba(148,163,184,0.15)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
              translateY: showcaseProgress.to([0, 0.5, 1], [60, 0, -30]),
              opacity: showcaseProgress.to([0, 0.3, 0.7, 1], [0, 1, 1, 0.85]),
              scale: showcaseProgress.to([0, 0.4, 1], [0.94, 1, 0.98]),
            }}
          >
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                borderBottomWidth: 1,
                borderBottomStyle: 'solid',
                borderBottomColor: 'rgba(148,163,184,0.1)',
              }}
            >
              {['#ef4444', '#f59e0b', '#22c55e'].map((c) => (
                <div
                  key={c}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: c,
                  }}
                />
              ))}
              <span
                style={{
                  marginLeft: 8,
                  fontSize: 12,
                  color: '#64748b',
                  fontFamily: 'monospace',
                }}
              >
                Hero.tsx
              </span>
            </div>
            <div
              style={{
                padding: '24px 28px',
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                fontSize: 13,
                lineHeight: 1.8,
                backgroundColor: '#0f172a',
              }}
            >
              {CODE_LINES.map((line, i) => (
                <animate.div
                  key={i}
                  style={{
                    color: line.highlight
                      ? '#a5b4fc'
                      : line.dim
                        ? '#475569'
                        : '#e2e8f0',
                    backgroundColor: line.highlight
                      ? 'rgba(99,102,241,0.12)'
                      : 'transparent',
                    padding: line.highlight ? '2px 8px' : '0 8px',
                    margin: '0 -8px',
                    borderRadius: 4,
                    opacity: showcaseProgress.to(
                      [0, 0.2 + i * 0.04, 0.35 + i * 0.04],
                      [0.3, 1, 1]
                    ),
                    translateX: showcaseProgress.to(
                      [0, 0.2 + i * 0.03, 0.4 + i * 0.03],
                      [-12, 0, 0]
                    ),
                  }}
                >
                  {line.text || '\u00A0'}
                </animate.div>
              ))}
            </div>
          </animate.div>
        </div>
      </section>

      {/* Stats */}
      <section
        style={{
          padding: '80px clamp(20px, 4vw, 48px)',
          backgroundColor: '#fff',
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 32,
            textAlign: 'center',
          }}
        >
          {[
            { value: '40+', label: 'Animation recipes' },
            { value: '5', label: 'Gesture hooks' },
            { value: '0', label: 'RAF boilerplate' },
            { value: '60', label: 'FPS target' },
          ].map((stat, i) => (
            <animate.div
              key={stat.label}
              style={{ opacity: 0, scale: 0.8 }}
              view={{
                opacity: withSequence([
                  withDelay(i * 100),
                  withTiming(1, { duration: 500 }),
                ]),
                scale: withSequence([
                  withDelay(i * 100),
                  withSpring(1, { stiffness: 200, damping: 18 }),
                ]),
              }}
              viewOptions={{ threshold: 0.4, once: true }}
            >
              <div
                style={{
                  fontSize: 'clamp(2rem, 5vw, 3rem)',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: 6,
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: 14, color: '#64748b', fontWeight: 500 }}>
                {stat.label}
              </div>
            </animate.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section
        id="testimonials"
        style={{
          padding: '100px clamp(20px, 4vw, 48px)',
          maxWidth: 1140,
          margin: '0 auto',
        }}
      >
        <RevealSection style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2
            style={{
              margin: 0,
              fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
              fontWeight: 800,
              letterSpacing: -0.6,
            }}
          >
            Loved by frontend teams
          </h2>
        </RevealSection>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 24,
          }}
        >
          {TESTIMONIALS.map((t, i) => (
            <animate.div
              key={t.author}
              style={{
                padding: 32,
                borderRadius: 16,
                backgroundColor: '#fff',
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: '#e2e8f0',
                opacity: 0,
                translateY: 32,
              }}
              view={{
                opacity: withSequence([
                  withDelay(i * 120),
                  withTiming(1, { duration: 600 }),
                ]),
                translateY: withSequence([
                  withDelay(i * 120),
                  withSpring(0, { stiffness: 130, damping: 22 }),
                ]),
              }}
              viewOptions={{ threshold: 0.2, once: true }}
              hover={{
                translateY: withSpring(-4, { stiffness: 300, damping: 22 }),
              }}
            >
              <p
                style={{
                  margin: '0 0 24px',
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: '#334155',
                }}
              >
                "{t.quote}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: `${t.color}18`,
                    color: t.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {t.avatar}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{t.author}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>{t.role}</div>
                </div>
              </div>
            </animate.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        id="cta"
        style={{
          padding: '120px clamp(20px, 4vw, 48px)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <animate.div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, #eef2ff 0%, #faf5ff 50%, #fdf2f8 100%)',
            translateY: pageProgress.to([0.7, 1], [40, -20]),
          }}
        />
        <RevealSection
          style={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
            maxWidth: 560,
            margin: '0 auto',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              fontWeight: 800,
              letterSpacing: -0.8,
            }}
          >
            Start building today
          </h2>
          <p
            style={{
              margin: '16px 0 32px',
              fontSize: 17,
              color: '#64748b',
              lineHeight: 1.6,
            }}
          >
            Install react-ui-animate and ship scroll-driven experiences your
            users will feel — not just see.
          </p>
          <animate.div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 20px',
              borderRadius: 12,
              backgroundColor: '#0f172a',
              color: '#e2e8f0',
              fontFamily: 'monospace',
              fontSize: 14,
              scale: 1,
            }}
            hover={{ scale: withSpring(1.02, { stiffness: 350, damping: 22 }) }}
          >
            <span style={{ color: '#64748b' }}>$</span>
            npm install react-ui-animate
          </animate.div>
        </RevealSection>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: '32px clamp(20px, 4vw, 48px)',
          borderTopWidth: 1,
          borderTopStyle: 'solid',
          borderTopColor: '#e2e8f0',
          textAlign: 'center',
          fontSize: 13,
          color: '#94a3b8',
          backgroundColor: '#fff',
        }}
      >
        Built with react-ui-animate · Scroll, reveal, and spring your way
      </footer>
    </div>
  );
};

export default Example;
