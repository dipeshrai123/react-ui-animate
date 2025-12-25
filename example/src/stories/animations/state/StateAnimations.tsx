import React, { useState } from 'react';
import { animate, Presence } from 'react-ui-animate';
import { ExampleLayout, Section, ExampleCard } from '../shared';

const Example: React.FC = () => {
  const [showCard, setShowCard] = useState(true);

  return (
    <ExampleLayout
      title="State Animations"
      description="Animations triggered by user interactions and viewport visibility. Demonstrates how properties like boxShadow, background, and filters work without initial styles."
      showRestartButton={false}
    >
      {/* Basic State Animations */}
      <Section title="Basic State Animations" description="Hover, press, and focus states with numeric properties">
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <ExampleCard description="Scale and color change on hover">
            <animate.div
              style={{
                width: 100,
                height: 100,
                backgroundColor: '#3399ff',
                borderRadius: 8,
                scale: 1,
              }}
              hover={{
                scale: 1.2,
                backgroundColor: '#ff6b6b',
              }}
            />
          </ExampleCard>

          <ExampleCard description="Scale down on press/tap">
            <animate.div
              style={{
                width: 100,
                height: 100,
                backgroundColor: '#51cf66',
                borderRadius: 8,
                scale: 1,
              }}
              press={{
                scale: 0.9,
              }}
            />
          </ExampleCard>

          <ExampleCard description="Scale and border color change on focus">
            <animate.input
              type="text"
              placeholder="Click to focus"
              style={{
                padding: '12px 16px',
                fontSize: 16,
                border: '2px solid #ccc',
                borderRadius: 8,
                outline: 'none',
                width: 200,
                scale: 1,
              }}
              focus={{
                scale: 1.05,
                borderColor: '#3399ff',
              }}
            />
          </ExampleCard>
        </div>
      </Section>

      {/* String Properties - boxShadow */}
      <Section 
        title="String Properties: boxShadow" 
        description="boxShadow animates from empty (no shadow) to shadow without initial style. Works with all states."
      >
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <ExampleCard description="Hover: boxShadow animates from empty to shadow">
            <animate.div
              style={{
                width: 150,
                height: 120,
                backgroundColor: '#3399ff',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer',
                // No boxShadow in initial style
              }}
              hover={{
                boxShadow: '0 8px 24px rgba(51, 153, 255, 0.4)',
                scale: 1.05,
              }}
            >
              Hover me
            </animate.div>
          </ExampleCard>

          <ExampleCard description="Press: boxShadow with spring animation">
            <animate.button
              style={{
                padding: '12px 24px',
                backgroundColor: '#51cf66',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 'bold',
                cursor: 'pointer',
                // No boxShadow in initial style
              }}
              press={{
                boxShadow: '0 4px 12px rgba(81, 207, 102, 0.5)',
                scale: 0.95,
              }}
            >
              Press me
            </animate.button>
          </ExampleCard>

          <ExampleCard description="Focus: boxShadow on input focus">
            <animate.input
              type="text"
              placeholder="Focus me..."
              style={{
                padding: '12px 16px',
                border: '2px solid #ddd',
                borderRadius: 8,
                fontSize: 16,
                outline: 'none',
                width: 200,
                // No boxShadow in initial style
              }}
              focus={{
                boxShadow: '0 0 0 3px rgba(255, 107, 107, 0.3)',
                borderColor: '#ff6b6b',
              }}
            />
          </ExampleCard>
        </div>
      </Section>

      {/* View State */}
      <Section 
        title="View State Animation" 
        description="Animations triggered when element enters viewport. Properties work without initial styles."
      >
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <ExampleCard description="View: boxShadow animates when element enters viewport">
            <div style={{ height: 200, overflow: 'auto', border: '1px solid #ddd', padding: 20, borderRadius: 8 }}>
              <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <animate.div
                  style={{
                    width: 150,
                    height: 120,
                    backgroundColor: '#845ef7',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    // No boxShadow or opacity in initial style
                  }}
                  view={{
                    boxShadow: '0 12px 32px rgba(132, 94, 247, 0.4)',
                    opacity: 1,
                    scale: 1,
                  }}
                  viewOptions={{
                    once: false,
                  }}
                >
                  Scroll to see
                </animate.div>
              </div>
            </div>
          </ExampleCard>

          <ExampleCard description="View: Multiple properties without initial styles">
            <div style={{ height: 200, overflow: 'auto', border: '1px solid #ddd', padding: 20, borderRadius: 8 }}>
              <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <animate.div
                  style={{
                    width: 150,
                    height: 120,
                    backgroundColor: '#ff6b6b',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    // No opacity, scale, or boxShadow in initial style
                  }}
                  view={{
                    opacity: 1,
                    scale: 1.1,
                    boxShadow: '0 8px 24px rgba(255, 107, 107, 0.4)',
                  }}
                  viewOptions={{
                    once: false,
                  }}
                >
                  View Animation
                </animate.div>
              </div>
            </div>
          </ExampleCard>
        </div>
      </Section>

      {/* Exit State */}
      <Section 
        title="Exit State Animation" 
        description="Exit animations work with string properties without initial styles."
      >
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <ExampleCard description="Exit: boxShadow animates on exit">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
              <button
                onClick={() => setShowCard(!showCard)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#ff6b6b',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                {showCard ? 'Remove Card' : 'Show Card'}
              </button>
              <Presence>
                {showCard && (
                  <animate.div
                    key="card"
                    style={{
                      width: 150,
                      height: 120,
                      backgroundColor: '#ffd43b',
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#333',
                      fontSize: 16,
                      fontWeight: 'bold',
                      // No boxShadow or opacity in initial style
                    }}
                    exit={{
                      boxShadow: '0 0 0 0 rgba(255, 212, 59, 0)',
                      opacity: 0,
                      scale: 0.8,
                    }}
                  >
                    Exit Animation
                  </animate.div>
                )}
              </Presence>
            </div>
          </ExampleCard>

          <ExampleCard description="Exit: opacity without initial style">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
              <button
                onClick={() => setShowCard(!showCard)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#51cf66',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                {showCard ? 'Remove' : 'Show'}
              </button>
              <Presence>
                {showCard && (
                  <animate.div
                    key="opacity-card"
                    style={{
                      width: 150,
                      height: 120,
                      backgroundColor: '#3399ff',
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: 16,
                      fontWeight: 'bold',
                      // No opacity in initial style
                    }}
                    exit={{
                      opacity: 0,
                      translateY: 20,
                    }}
                  >
                    Fade Out
                  </animate.div>
                )}
              </Presence>
            </div>
          </ExampleCard>
        </div>
      </Section>

      {/* Background and Filters */}
      <Section 
        title="Background and Filters" 
        description="String properties like background and filter work without initial styles."
      >
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <ExampleCard description="Hover: background gradient without initial style">
            <animate.div
              style={{
                width: 150,
                height: 120,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer',
                backgroundColor: '#3399ff',
                // No background gradient in initial style
              }}
              hover={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                scale: 1.05,
              }}
            >
              Hover me
            </animate.div>
          </ExampleCard>

          <ExampleCard description="Hover: filter blur without initial style">
            <animate.div
              style={{
                width: 150,
                height: 120,
                backgroundColor: '#51cf66',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer',
                // No filter in initial style
              }}
              hover={{
                filter: 'blur(2px) brightness(1.2)',
                scale: 1.1,
              }}
            >
              Hover me
            </animate.div>
          </ExampleCard>

          <ExampleCard description="Press: backdropFilter without initial style">
            <animate.div
              style={{
                width: 150,
                height: 120,
                backgroundImage: 'url("https://via.placeholder.com/150")',
                backgroundSize: 'cover',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer',
                position: 'relative',
                // No backdropFilter in initial style
              }}
              press={{
                backdropFilter: 'blur(10px)',
                scale: 0.95,
              }}
            >
              <div style={{ 
                position: 'absolute', 
                inset: 0, 
                backgroundColor: 'rgba(0,0,0,0.3)',
                borderRadius: 12,
              }} />
              <span style={{ position: 'relative', zIndex: 1 }}>Press me</span>
            </animate.div>
          </ExampleCard>
        </div>
      </Section>

      {/* Multiple Properties */}
      <Section 
        title="Multiple Properties Together" 
        description="Multiple properties (numeric and string) animate together without initial styles."
      >
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <ExampleCard description="Hover: opacity, scale, and boxShadow without initial styles">
            <animate.div
              style={{
                width: 150,
                height: 120,
                backgroundColor: '#845ef7',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 16,
                fontWeight: 'bold',
                cursor: 'pointer',
                // No opacity, scale, or boxShadow in initial style
              }}
              hover={{
                opacity: 0.8,
                scale: 1.1,
                boxShadow: '0 12px 32px rgba(132, 94, 247, 0.4)',
              }}
            >
              Hover for All
            </animate.div>
          </ExampleCard>

          <ExampleCard description="Press: translateY, scale, and boxShadow without initial styles">
            <animate.button
              style={{
                padding: '12px 24px',
                backgroundColor: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 'bold',
                cursor: 'pointer',
                // No translateY, scale, or boxShadow in initial style
              }}
              press={{
                translateY: 2,
                scale: 0.95,
                boxShadow: '0 4px 12px rgba(255, 107, 107, 0.5)',
              }}
            >
              Press me
            </animate.button>
          </ExampleCard>

          <ExampleCard description="View: opacity, scale, boxShadow, and filter without initial styles">
            <div style={{ height: 200, overflow: 'auto', border: '1px solid #ddd', padding: 20, borderRadius: 8 }}>
              <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <animate.div
                  style={{
                    width: 150,
                    height: 120,
                    backgroundColor: '#ffd43b',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#333',
                    fontWeight: 'bold',
                    // No properties in initial style
                  }}
                  view={{
                    opacity: 1,
                    scale: 1.05,
                    boxShadow: '0 8px 24px rgba(255, 212, 59, 0.4)',
                    filter: 'brightness(1.1)',
                  }}
                  viewOptions={{
                    once: false,
                  }}
                >
                  Scroll to see
                </animate.div>
              </div>
            </div>
          </ExampleCard>
        </div>
      </Section>

      {/* Combined States */}
      <Section 
        title="Combined State Animations" 
        description="Multiple states working together with properties that don't have initial styles."
      >
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <ExampleCard description="Hover + Press: boxShadow and scale without initial styles">
            <animate.div
              style={{
                width: 120,
                height: 120,
                backgroundColor: '#845ef7',
                borderRadius: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                // No scale or boxShadow in initial style
              }}
              hover={{
                scale: 1.1,
                boxShadow: '0 8px 24px rgba(132, 94, 247, 0.4)',
                backgroundColor: '#a78bfa',
              }}
              press={{
                scale: 0.95,
                boxShadow: '0 4px 12px rgba(132, 94, 247, 0.6)',
              }}
            >
              Hover & Press
            </animate.div>
          </ExampleCard>

          <ExampleCard description="Focus + Hover: boxShadow and borderColor without initial styles">
            <animate.input
              type="text"
              placeholder="Focus or hover..."
              style={{
                padding: '12px 16px',
                fontSize: 16,
                border: '2px solid #ccc',
                borderRadius: 8,
                outline: 'none',
                width: 200,
                // No boxShadow or borderColor in initial style
              }}
              hover={{
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
              focus={{
                boxShadow: '0 0 0 3px rgba(51, 153, 255, 0.3)',
                borderColor: '#3399ff',
              }}
            />
          </ExampleCard>
        </div>
      </Section>
    </ExampleLayout>
  );
};

export default Example;
