import { useRef, useState } from 'react';
import { animate, Gesture, useGesture, useValue } from 'react-ui-animate';
import { ExampleLayout } from '../../../animations/shared';

function Example() {
  const areaRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [tooltipX, setTooltipX] = useValue(0);
  const [tooltipY, setTooltipY] = useValue(0);

  useGesture(
    areaRef,
    Gesture.Hover()
      .onChange(({ offset, hovering }) => {
        setVisible(hovering);
        setTooltipX(offset.x);
        setTooltipY(offset.y);
      })
      .onEnd(() => setVisible(false))
  );

  return (
    <ExampleLayout
      title="Gesture.Hover() — Tooltip"
      description="Uses HoverEvent's offset (position relative to the target) and hovering flag to drive a tooltip that follows the pointer and hides on leave."
      onRestart={() => setVisible(false)}
    >
      <div
        ref={areaRef}
        style={{
          width: '100%',
          height: 320,
          position: 'relative',
          border: '2px solid #e0e0e0',
          borderRadius: 12,
          backgroundColor: '#fafafa',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
        }}
      >
        Move your pointer over this area
        {visible && (
          <animate.div
            style={{
              position: 'absolute',
              pointerEvents: 'none',
              left: tooltipX.to((v) => v + 16),
              top: tooltipY.to((v) => v + 16),
              backgroundColor: '#1a1a1a',
              color: 'white',
              padding: '6px 10px',
              borderRadius: 6,
              fontSize: 12,
              whiteSpace: 'nowrap',
            }}
          >
            following your pointer
          </animate.div>
        )}
      </div>
    </ExampleLayout>
  );
}

export default Example;
