import React, { useState, useRef } from 'react';
import {
  animate,
  AnimatePresence,
  withTiming,
  withSpring,
  useOutsideClick,
} from 'react-ui-animate';

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
        backgroundColor: withTiming('rgba(0,0,0,0.5)', { duration: 200 }),
      }}
      exit={{
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
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          opacity: 0,
          scale: 0.9,
          translateY: 20,
        }}
        animate={{
          opacity: withTiming(1, { duration: 200 }),
          scale: withSpring(1, { stiffness: 300, damping: 25 }),
          translateY: withSpring(0, { stiffness: 300, damping: 25 }),
        }}
        exit={{
          opacity: withTiming(0, { duration: 150 }),
          scale: withSpring(0.9, { stiffness: 300, damping: 25 }),
          translateY: withSpring(20, { stiffness: 300, damping: 25 }),
        }}
      >
        <h2 style={{ margin: '0 0 16px', color: '#333' }}>Modal Title</h2>
        <p style={{ margin: '0 0 24px', color: '#666' }}>
          This is a modal with enter and exit animations powered by
          AnimatePresence.
        </p>
        <button
          onClick={onClose}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3399ff',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          Close Modal
        </button>
      </animate.div>
    </animate.div>
  );
};

const Example: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
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
        Open Modal
      </button>

      <AnimatePresence>
        {isOpen && <Modal key="modal" onClose={() => setIsOpen(false)} />}
      </AnimatePresence>
    </>
  );
};

export default Example;

