import { useState } from 'react';
import { animate } from 'react-ui-animate';
import { ExampleLayout } from '../../animations/shared';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    id: 1,
    question: 'What is the `layout` prop?',
    answer:
      'It automatically animates position and size changes on an element — reordering, resizing, insertion or removal of siblings — using a FLIP-style transform, so you never have to compute translate/scale math by hand.',
  },
  {
    id: 2,
    question: 'How does it know what changed?',
    answer:
      'It measures the element before and after each render. If the position or size differs, it instantly jumps the element back to where it was (visually) and springs it to its new place.',
  },
  {
    id: 3,
    question: 'Does it work with lists and grids?',
    answer:
      'Yes — reordering, filtering, or resizing items in a `flex`/`grid` container all trigger smooth reflow animations on every affected sibling, not just the one that changed.',
  },
  {
    id: 4,
    question: 'Can I tune the transition?',
    answer:
      'Yes — pass `layoutOptions={withSpring({ stiffness, damping })}` or `layoutOptions={withTiming({ duration })}`, the same descriptor helpers used by `animate` / `hover` / `exit`.',
  },
  {
    id: 5,
    question: 'Any limitations?',
    answer:
      "Avoid also animating translateX/Y or scaleX/Y via `animate`/`hover`/`press`/`view` on the same element — those transforms are reserved internally for the layout transition itself.",
  },
];

const Example = () => {
  const [openId, setOpenId] = useState<number | null>(1);

  return (
    <ExampleLayout
      title="Layout Animation — Accordion"
      description="Expanding or collapsing one question instantly resizes it — and every other item in the list smoothly animates to its new position using the `layout` prop, with no manual height math."
      showRestartButton={false}
    >
      <div
        style={{
          maxWidth: 640,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {FAQS.map((item) => {
          const isOpen = item.id === openId;

          return (
            <animate.div
              key={item.id}
              layout
              style={{
                borderRadius: 12,
                border: `2px solid ${isOpen ? '#3399ff' : '#e5e7eb'}`,
                backgroundColor: isOpen ? '#f0f9ff' : '#fff',
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => setOpenId(isOpen ? null : item.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '18px 20px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 16,
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#1a1a1a',
                }}
              >
                {item.question}
                <span
                  style={{
                    flexShrink: 0,
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    backgroundColor: isOpen ? '#3399ff' : '#f1f5f9',
                    color: isOpen ? '#fff' : '#666',
                    fontSize: 16,
                    lineHeight: '22px',
                    textAlign: 'center',
                    transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s, background-color 0.2s, color 0.2s',
                  }}
                >
                  +
                </span>
              </button>
              {isOpen && (
                <div
                  style={{
                    padding: '0 20px 18px',
                    fontSize: 14,
                    color: '#555',
                    lineHeight: 1.6,
                  }}
                >
                  {item.answer}
                </div>
              )}
            </animate.div>
          );
        })}
      </div>
    </ExampleLayout>
  );
};

export default Example;
