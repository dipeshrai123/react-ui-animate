import { useRef, useState } from 'react';
import { Presence, animate, useOutsideClick, withSpring, withTiming } from 'react-ui-animate';

const Modal = ({
  onClose,
}: {
  onClose: () => void;
}) => {
  const ref = useRef(null);
  useOutsideClick(ref, onClose);

  return (
    <animate.div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0)',
        opacity: 0,
      }}
      animate={{
        backgroundColor: withTiming('rgba(0,0,0,0.2)', { duration: 200 }),
        opacity: withTiming(1, { duration: 200 }),
      }}
      exit={{
        backgroundColor: withTiming('rgba(0,0,0,0)', { duration: 200 }),
        opacity: withTiming(0, { duration: 200 }),
      }}
    >
      <animate.div
        ref={ref}
        style={{
          width: '60%',
          height: 300,
          backgroundColor: 'white',
          borderRadius: 4,
          padding: 20,
          scale: 0.5,
          translateY: -100,
        }}
        animate={{
          scale: withSpring(1, { stiffness: 200, damping: 20 }),
          translateY: withSpring(0, { stiffness: 200, damping: 20 }),
        }}
        exit={{
          scale: withSpring(0.5, { stiffness: 200, damping: 20 }),
          translateY: withSpring(-100, { stiffness: 200, damping: 20 }),
        }}
      >
        <button
          style={{
            position: 'absolute',
            right: 20,
            top: 20,
          }}
          onClick={onClose}
        >
          CLOSE MODAL
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          MODAL CONTENT
        </div>
      </animate.div>
    </animate.div>
  );
};

const Example = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button onClick={() => setModalOpen(true)}>OPEN MODAL</button>
      <Presence>
        {modalOpen && <Modal key="modal" onClose={() => setModalOpen(false)} />}
      </Presence>
    </>
  );
};

export default Example;
