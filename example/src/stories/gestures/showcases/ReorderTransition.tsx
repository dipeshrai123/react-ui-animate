import { useState } from 'react';
import { Reorder, withSpring, withTiming } from 'react-ui-animate';
import type { FlipOptions } from 'react-ui-animate';

const INITIAL_ITEMS = ['Design review', 'Write tests', 'Ship the release', 'Update docs'];

const PRESETS: Record<string, { label: string; transition: FlipOptions }> = {
  snappy: {
    label: 'Snappy spring (default)',
    transition: withSpring({ stiffness: 500, damping: 40 }),
  },
  bouncy: {
    label: 'Bouncy spring',
    transition: withSpring({ stiffness: 300, damping: 12 }),
  },
  soft: {
    label: 'Soft spring',
    transition: withSpring({ stiffness: 120, damping: 20 }),
  },
  timing: {
    label: 'Linear timing (300ms)',
    transition: withTiming({ duration: 300 }),
  },
};

const Example = () => {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [preset, setPreset] = useState<keyof typeof PRESETS>('snappy');

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 10 }}>Reorder — custom transition</h1>
      <p style={{ marginBottom: 20, color: '#666', maxWidth: 520 }}>
        <code>transition</code> on <code>Reorder.Group</code> controls how a
        released item settles and how displaced neighbors spring out of the
        way — same descriptor helpers as <code>animate</code>/
        <code>flipOptions</code> elsewhere in the library (
        <code>withSpring</code>, <code>withTiming</code>, or a raw spring
        config object).
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {(Object.keys(PRESETS) as Array<keyof typeof PRESETS>).map((key) => (
          <button
            key={key}
            onClick={() => setPreset(key)}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: '2px solid #3399ff',
              backgroundColor: preset === key ? '#3399ff' : 'white',
              color: preset === key ? 'white' : '#3399ff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {PRESETS[key].label}
          </button>
        ))}
      </div>

      <Reorder.Group
        values={items}
        onReorder={setItems}
        transition={PRESETS[preset].transition}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          maxWidth: 360,
        }}
      >
        {items.map((item) => (
          <Reorder.Item
            key={item}
            value={item}
            style={{
              padding: '16px 20px',
              borderRadius: 10,
              backgroundColor: '#f0f9ff',
              border: '2px solid #3399ff',
              fontSize: 15,
              fontWeight: 500,
              color: '#1a1a1a',
              boxShadow: '0 2px 8px rgba(51, 153, 255, 0.15)',
            }}
          >
            {item}
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
};

export default Example;
