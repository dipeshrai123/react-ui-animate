import React, { useState } from 'react';
import { animate, recipes, Presence } from 'react-ui-animate';
import { ExampleLayout, Section, ExampleCard } from '../shared';

const Example: React.FC = () => {
  const [mounted, setMounted] = useState(true);

  return (
    <ExampleLayout
      title="Animation Recipes"
      description="Pre-built, tested animations for common use cases. Import individual recipes or use the recipes object."
      showRestartButton={false}
    >
      <Section title="Fade Animations" description="Simple opacity-based animations">
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <ExampleCard>
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
          </ExampleCard>
          <ExampleCard>
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
          </ExampleCard>
          <ExampleCard>
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
          </ExampleCard>
          <ExampleCard>
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
          </ExampleCard>
        </div>
      </Section>

      <Section title="Slide Animations" description="Directional slide animations">
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <ExampleCard>
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
          </ExampleCard>
          <ExampleCard>
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
          </ExampleCard>
          <ExampleCard>
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
          </ExampleCard>
        </div>
      </Section>

      <Section title="Scale Animations" description="Size-based animations">
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <ExampleCard>
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
          </ExampleCard>
          <ExampleCard>
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
          </ExampleCard>
          <ExampleCard>
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
          </ExampleCard>
        </div>
      </Section>

      <Section title="Bounce Animations" description="Bouncy, playful animations">
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <ExampleCard>
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
          </ExampleCard>
        </div>
      </Section>

      <Section title="Combined Animations" description="Multiple properties animated together">
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <ExampleCard>
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
          </ExampleCard>
          <ExampleCard>
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
          </ExampleCard>
        </div>
      </Section>

      <Section title="Hover Animations" description="Pre-built hover state animations">
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <ExampleCard>
            <animate.div
              style={{
                width: 100,
                height: 100,
                backgroundColor: '#3399ff',
                borderRadius: 8,
                cursor: 'pointer',
              }}
              hover={recipes.hoverScale}
            />
          </ExampleCard>
          <ExampleCard>
            <animate.div
              style={{
                width: 100,
                height: 100,
                backgroundColor: '#ff6b6b',
                borderRadius: 8,
                cursor: 'pointer',
              }}
              hover={recipes.hoverLift}
            />
          </ExampleCard>
          <ExampleCard>
            <animate.div
              style={{
                width: 100,
                height: 100,
                backgroundColor: '#51cf66',
                borderRadius: 8,
                cursor: 'pointer',
              }}
              hover={recipes.hoverGlow}
            />
          </ExampleCard>
        </div>
      </Section>

      <Section title="Press Animations" description="Pre-built press/tap state animations">
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <ExampleCard>
            <animate.div
              style={{
                width: 100,
                height: 100,
                backgroundColor: '#ffd43b',
                borderRadius: 8,
                cursor: 'pointer',
              }}
              press={recipes.pressScale}
            />
          </ExampleCard>
          <ExampleCard>
            <animate.div
              style={{
                width: 100,
                height: 100,
                backgroundColor: '#845ef7',
                borderRadius: 8,
                cursor: 'pointer',
              }}
              press={recipes.pressDown}
            />
          </ExampleCard>
        </div>
      </Section>

      <Section title="Exit Animations" description="Animations for elements leaving the DOM">
        <ExampleCard>
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
              }}
            >
              {mounted ? 'Hide' : 'Show'} Element
            </button>
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <Presence>
              {mounted && (
                <animate.div
                  style={{
                    width: 100,
                    height: 100,
                    backgroundColor: '#ff6b6b',
                    borderRadius: 8,
                    opacity: 0,
                  }}
                  animate={recipes.fadeIn}
                  exit={recipes.exitFade}
                />
              )}
            </Presence>
            <Presence>
              {mounted && (
                <animate.div
                  style={{
                    width: 100,
                    height: 100,
                    backgroundColor: '#51cf66',
                    borderRadius: 8,
                    opacity: 0,
                    translateY: 20,
                  }}
                  animate={recipes.slideFadeIn}
                  exit={recipes.exitSlideUp}
                />
              )}
            </Presence>
          </div>
        </ExampleCard>
      </Section>

      <Section title="Usage Example" description="How to import and use recipes">
        <ExampleCard>
          <pre
            style={{
              backgroundColor: '#f5f5f5',
              padding: 20,
              borderRadius: 8,
              overflow: 'auto',
              margin: 0,
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            {`import { fadeIn, slideInUp, hoverScale } from 'react-ui-animate';

// Use individual recipes
<animate.div animate={fadeIn} />
<animate.div animate={slideInUp} />
<animate.div hover={hoverScale} />

// Or use the recipes object
import { recipes } from 'react-ui-animate';
<animate.div animate={recipes.fadeIn} />
<animate.div hover={recipes.hoverScale} />`}
          </pre>
        </ExampleCard>
      </Section>
    </ExampleLayout>
  );
};

export default Example;

