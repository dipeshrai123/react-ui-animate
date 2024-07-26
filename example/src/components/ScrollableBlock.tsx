import React from 'react';
import { ScrollableBlock, animate, bInterpolate } from 'react-ui-animate';

export const SCBlock: React.FC = () => {
  return (
    <>
      <div style={{ height: 1000, backgroundColor: '#e1e1e1' }} />

      <ScrollableBlock direction="both" threshold={0.5}>
        {(animation) => (
          <animate.div
            style={{
              height: 500,
              backgroundColor: '#3399ff',
              opacity: animation.value,
              transform: bInterpolate(
                animation.value,
                'translateY(500px)',
                'translateY(0px)'
              ),
            }}
          />
        )}
      </ScrollableBlock>
    </>
  );
};
