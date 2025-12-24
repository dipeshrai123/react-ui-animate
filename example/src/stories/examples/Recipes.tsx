import React, { useState } from 'react';
import { animate, recipes, Presence } from 'react-ui-animate';

const Example: React.FC = () => {
  const [mounted, setMounted] = useState(true);
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 30 }}>Animation Recipes</h1>
      <p style={{ marginBottom: 40, color: '#666' }}>
        Pre-built, tested animations for common use cases
      </p>

      {/* Fade Animations */}
      <section style={{ marginBottom: 60 }}>
        <h2 style={{ marginBottom: 20 }}>Fade Animations</h2>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <animate.div
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#3399ff',
              borderRadius: 8,
              opacity: 0,
            }}
            animate={recipes.fadeIn}
          />
          <animate.div
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#ff6b6b',
              borderRadius: 8,
              opacity: 0,
              translateY: 20,
            }}
            animate={recipes.fadeInUp}
          />
          <animate.div
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#51cf66',
              borderRadius: 8,
              opacity: 0,
              translateX: -20,
            }}
            animate={recipes.fadeInLeft}
          />
          <animate.div
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#ffd43b',
              borderRadius: 8,
              opacity: 0,
              translateX: 20,
            }}
            animate={recipes.fadeInRight}
          />
        </div>
      </section>

      {/* Slide Animations */}
      <section style={{ marginBottom: 60 }}>
        <h2 style={{ marginBottom: 20 }}>Slide Animations</h2>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <animate.div
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#845ef7',
              borderRadius: 8,
              translateY: 50,
            }}
            animate={recipes.slideInUp}
          />
          <animate.div
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#ff8787',
              borderRadius: 8,
              translateX: -50,
            }}
            animate={recipes.slideInRight}
          />
          <animate.div
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#20c997',
              borderRadius: 8,
              translateX: 50,
            }}
            animate={recipes.slideInLeft}
          />
        </div>
      </section>

      {/* Scale Animations */}
      <section style={{ marginBottom: 60 }}>
        <h2 style={{ marginBottom: 20 }}>Scale Animations</h2>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <animate.div
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#ff6b6b',
              borderRadius: 8,
              scale: 0,
              opacity: 0,
            }}
            animate={recipes.scaleIn}
          />
          <animate.div
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#51cf66',
              borderRadius: 8,
              scale: 0.5,
            }}
            animate={recipes.scaleUp}
          />
          <animate.div
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#ffd43b',
              borderRadius: 8,
              scale: 1.2,
            }}
            animate={recipes.scaleDown}
          />
        </div>
      </section>

      {/* Bounce Animations */}
      <section style={{ marginBottom: 60 }}>
        <h2 style={{ marginBottom: 20 }}>Bounce Animations</h2>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <animate.div
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#3399ff',
              borderRadius: 8,
              scale: 0,
              opacity: 0,
            }}
            animate={recipes.bounceIn}
          />
        </div>
      </section>

      {/* Combined Animations */}
      <section style={{ marginBottom: 60 }}>
        <h2 style={{ marginBottom: 20 }}>Combined Animations</h2>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <animate.div
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#845ef7',
              borderRadius: 8,
              opacity: 0,
              translateY: 20,
            }}
            animate={recipes.slideFadeIn}
          />
          <animate.div
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#ff8787',
              borderRadius: 8,
              scale: 0.8,
              opacity: 0,
            }}
            animate={recipes.scaleFadeIn}
          />
        </div>
      </section>

      {/* Hover Animations */}
      <section style={{ marginBottom: 60 }}>
        <h2 style={{ marginBottom: 20 }}>Hover Animations</h2>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <animate.div
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#3399ff',
              borderRadius: 8,
            }}
            hover={recipes.hoverScale}
          />
          <animate.div
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#ff6b6b',
              borderRadius: 8,
            }}
            hover={recipes.hoverLift}
          />
          <animate.div
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#51cf66',
              borderRadius: 8,
            }}
            hover={recipes.hoverGlow}
          />
        </div>
      </section>

      {/* Press Animations */}
      <section style={{ marginBottom: 60 }}>
        <h2 style={{ marginBottom: 20 }}>Press Animations</h2>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <animate.div
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#ffd43b',
              borderRadius: 8,
            }}
            press={recipes.pressScale}
          />
          <animate.div
            style={{
              width: 100,
              height: 100,
              backgroundColor: '#845ef7',
              borderRadius: 8,
            }}
            press={recipes.pressDown}
          />
        </div>
      </section>

      {/* Exit Animations */}
      <section style={{ marginBottom: 60 }}>
        <h2 style={{ marginBottom: 20 }}>Exit Animations</h2>
        <div style={{ marginBottom: 20 }}>
          <button
            onClick={() => setMounted(!mounted)}
            style={{
              padding: '12px 24px',
              fontSize: 16,
              backgroundColor: '#3399ff',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              marginBottom: 20,
            }}
          >
            {mounted ? 'Hide' : 'Show'} Element
          </button>
        </div>
        <Presence>
          {mounted && (
            <animate.div
              style={{
                width: 100,
                height: 100,
                backgroundColor: '#ff6b6b',
                borderRadius: 8,
                opacity: 1,
              }}
              animate={recipes.fadeIn}
              exit={recipes.exitFade}
            />
          )}
        </Presence>
        <div style={{ marginTop: 20 }}>
          <Presence>
            {mounted && (
              <animate.div
                style={{
                  width: 100,
                  height: 100,
                  backgroundColor: '#51cf66',
                  borderRadius: 8,
                  opacity: 1,
                  translateY: 0,
                }}
                animate={recipes.slideFadeIn}
                exit={recipes.exitSlideUp}
              />
            )}
          </Presence>
        </div>
      </section>

      {/* Using Individual Recipes */}
      <section style={{ marginBottom: 60 }}>
        <h2 style={{ marginBottom: 20 }}>Using Individual Recipes</h2>
        <p style={{ marginBottom: 20, color: '#666' }}>
          You can also import individual recipes:
        </p>
        <pre
          style={{
            backgroundColor: '#f5f5f5',
            padding: 20,
            borderRadius: 8,
            overflow: 'auto',
          }}
        >
          {`import { fadeIn, slideInUp, hoverScale } from 'react-ui-animate';

<animate.div animate={fadeIn} />
<animate.div animate={slideInUp} />
<animate.div hover={hoverScale} />`}
        </pre>
      </section>
    </div>
  );
};

export default Example;
