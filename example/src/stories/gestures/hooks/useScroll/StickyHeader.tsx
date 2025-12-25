import { useRef } from 'react';
import { animate, useScroll, useValue, withSpring } from 'react-ui-animate';

/**
 * Real-world example: Sticky Header with Scroll Effects
 *
 * This demonstrates useScroll for creating a sticky header that:
 * - Changes appearance on scroll
 * - Shrinks/grows based on scroll position
 * - Shows scroll progress
 */
const Example = () => {
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useValue(80);
  const [headerOpacity, setHeaderOpacity] = useValue(1);
  const [scrollProgress, setScrollProgress] = useValue(0);

  useScroll(window, ({ offset }) => {
    const scrollY = offset.y;

    // Shrink header on scroll
    if (scrollY > 0) {
      setHeaderHeight(withSpring(60, { stiffness: 300, damping: 30 }));
      setHeaderOpacity(withSpring(0.95, { stiffness: 300, damping: 30 }));
    } else {
      setHeaderHeight(withSpring(80, { stiffness: 300, damping: 30 }));
      setHeaderOpacity(withSpring(1, { stiffness: 300, damping: 30 }));
    }

    // Calculate scroll progress
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min(1, scrollY / maxScroll);
    setScrollProgress(progress);
  });

  return (
    <div style={{ backgroundColor: '#f5f5f5' }}>
      {/* Sticky Header */}
      <animate.div
        ref={headerRef}
        style={{
          position: 'sticky',
          top: 0,
          width: '100%',
          backgroundColor: 'white',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 40px',
          height: headerHeight,
          opacity: headerOpacity,
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 700, color: '#333' }}>Logo</div>
        <nav style={{ display: 'flex', gap: 32 }}>
          {['Home', 'About', 'Services', 'Contact'].map((item) => (
            <button
              key={item}
              type="button"
              style={{
                background: 'none',
                border: 'none',
                color: '#666',
                fontSize: 16,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#333')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#666')}
            >
              {item}
            </button>
          ))}
        </nav>
      </animate.div>

      {/* Scroll Progress Bar */}
      <animate.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: scrollProgress.to([0, 1], ['0%', '100%']),
          height: 3,
          backgroundColor: '#6366f1',
          zIndex: 1001,
        }}
      />

      {/* Content */}
      <div style={{ padding: '80px 40px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1
            style={{
              fontSize: 64,
              fontWeight: 700,
              marginBottom: 24,
              color: '#333',
            }}
          >
            Scroll Down
          </h1>
          <p
            style={{
              fontSize: 20,
              color: '#666',
              lineHeight: 1.6,
              marginBottom: 40,
            }}
          >
            Watch the header shrink and the progress bar fill as you scroll.
            This demonstrates how useScroll can be used to create dynamic
            scroll-based UI effects.
          </p>

          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              style={{
                padding: 40,
                marginBottom: 24,
                backgroundColor: 'white',
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <h2
                style={{
                  fontSize: 32,
                  fontWeight: 600,
                  marginBottom: 16,
                  color: '#333',
                }}
              >
                Section {i + 1}
              </h2>
              <p style={{ fontSize: 16, color: '#666', lineHeight: 1.6 }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Example;
