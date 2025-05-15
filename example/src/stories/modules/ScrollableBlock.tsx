import React from 'react';
import { ScrollableBlock, animate } from 'react-ui-animate';

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
              translateY: animation.value.to([0, 1], [500, 0]),
            }}
          />
        )}
      </ScrollableBlock>
    </>
  );
};
