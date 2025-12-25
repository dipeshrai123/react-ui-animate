import { useRef } from 'react';
import { animate, useScroll } from 'react-ui-animate';

/**
 * Real-world example: Scroll Parallax Effect
 * 
 * This demonstrates useScroll with scroll progress for:
 * - Parallax scrolling effects
 * - Multiple elements moving at different speeds
 * - Smooth scroll-based animations
 */
const Example = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll(window, {
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '300vh' }}>
      <div ref={containerRef} style={{ position: 'relative', height: '200vh' }}>
        {/* Background layer - moves slowest */}
        <animate.div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            translateY: scrollYProgress.to([0, 1], [0, -200]),
            zIndex: 1,
          }}
        />

        {/* Middle layer */}
        <animate.div
          style={{
            position: 'fixed',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            translateY: scrollYProgress.to([0, 1], [0, -100]),
            opacity: scrollYProgress.to([0, 0.5, 1], [1, 1, 0]),
            zIndex: 2,
          }}
        />

        {/* Foreground layer - moves fastest */}
        <animate.div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            translateY: scrollYProgress.to([0, 1], [0, 100]),
            scale: scrollYProgress.to([0, 1], [1, 1.5]),
            zIndex: 3,
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            padding: '100vh 40px 40px',
            color: 'white',
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: 64, fontWeight: 700, marginBottom: 24 }}>
            Scroll Parallax
          </h1>
          <p style={{ fontSize: 20, opacity: 0.9, maxWidth: 600, margin: '0 auto' }}>
            Scroll to see the parallax effect. Different layers move at different
            speeds based on scroll progress.
          </p>
        </div>
      </div>

      {/* Additional content */}
      <div style={{ padding: '40px', color: 'white', minHeight: '100vh' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ marginBottom: 60 }}>
              <h2 style={{ fontSize: 36, fontWeight: 600, marginBottom: 16 }}>
                Section {i + 1}
              </h2>
              <p style={{ fontSize: 18, lineHeight: 1.8, opacity: 0.8 }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Example;

