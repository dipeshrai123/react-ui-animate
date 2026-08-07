import React, { useState, useRef } from 'react';
import {
  animate,
  Unmount,
  withTiming,
  withSpring,
  useOutsideClick,
} from 'react-ui-animate';
import { ExampleLayout, ExampleCard, Button } from '../../shared';

const Modal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, onClose);

  return (
    <animate.div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0)',
      }}
      animate={{
        backgroundColor: withTiming('rgba(0,0,0,0.6)', { duration: 200 }),
      }}
      unmount={{
        backgroundColor: withTiming('rgba(0,0,0,0)', { duration: 200 }),
      }}
    >
      <animate.div
        ref={ref}
        style={{
          width: 400,
          padding: 24,
          backgroundColor: 'white',
          borderRadius: 12,
          boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
          opacity: 0,
          scale: 0.9,
          translateY: 20,
        }}
        animate={{
          opacity: withTiming(1, { duration: 200 }),
          scale: withSpring(1, { stiffness: 300, damping: 25 }),
          translateY: withSpring(0, { stiffness: 300, damping: 25 }),
        }}
        unmount={{
          opacity: withTiming(0, { duration: 150 }),
          scale: withSpring(0.9, { stiffness: 300, damping: 25 }),
          translateY: withSpring(20, { stiffness: 300, damping: 25 }),
        }}
      >
        <h2 style={{ margin: '0 0 16px', color: '#1a1a1a' }}>Modal title</h2>
        <p style={{ margin: '0 0 24px', color: '#666' }}>
          The overlay and this dialog each declare their own unmount animation.
        </p>
        <Button variant="primary" onClick={onClose}>
          Close modal
        </Button>
      </animate.div>
    </animate.div>
  );
};

const Example: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ExampleLayout
      tag="MODULE"
      title="Unmount with a modal"
      description="The overlay and the dialog each declare their own unmount animation, and Unmount keeps both mounted until they finish fading and scaling out."
      showRestartButton={false}
    >
      <ExampleCard>
        <Button variant="primary" onClick={() => setIsOpen(true)}>
          Open modal
        </Button>

        <Unmount>
          {isOpen && <Modal key="modal" onClose={() => setIsOpen(false)} />}
        </Unmount>
      </ExampleCard>
    </ExampleLayout>
  );
};

export default Example;
