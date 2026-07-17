import { useState } from 'react';
import { animate, LayoutGroup } from 'react-ui-animate';
import { ExampleLayout, Section, ExampleCard } from '../../animations/shared';

const TABS = ['One', 'Two', 'Three'];

function TabRow({ groupLabel }: { groupLabel: string }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <p style={{ margin: '0 0 8px', fontSize: 12, color: '#999' }}>
        {groupLabel}
      </p>
      <div
        style={{
          position: 'relative',
          display: 'inline-flex',
          gap: 4,
          padding: 4,
          backgroundColor: '#f0f0f0',
          borderRadius: 10,
        }}
      >
        {TABS.map((label, index) => (
          <button
            key={label}
            onClick={() => setActive(index)}
            style={{
              position: 'relative',
              padding: '8px 16px',
              fontSize: 14,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: active === index ? 'white' : '#333',
              zIndex: 1,
            }}
          >
            {active === index && (
              <animate.div
                layoutId="indicator"
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: '#3399ff',
                  borderRadius: 7,
                  zIndex: -1,
                }}
              />
            )}
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

const Example = () => {
  return (
    <ExampleLayout
      title="Layout Animation — LayoutGroup"
      description="layoutId shared-element transitions normally use one global registry, so two unrelated components using the same layoutId string would cross-transition. LayoutGroup scopes the registry to its own subtree — both tab rows below use the same layoutId ('indicator'), but wrapping each in its own LayoutGroup keeps them fully independent."
    >
      <Section
        title="Two Independently-Scoped Tab Selectors"
        description="Click tabs in either row — the other row's indicator never jumps, even though both use layoutId=&quot;indicator&quot;."
      >
        <ExampleCard>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <LayoutGroup>
              <TabRow groupLabel="Group 1" />
            </LayoutGroup>
            <LayoutGroup>
              <TabRow groupLabel="Group 2" />
            </LayoutGroup>
          </div>
        </ExampleCard>
      </Section>
    </ExampleLayout>
  );
};

export default Example;
