import { useRef, useState } from 'react';

import { MountedBlock, animate, useOutsideClick } from 'react-ui-animate';

const Modal = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const ref = useRef(null);
  useOutsideClick(ref, onClose);

  return (
    <MountedBlock state={visible}>
      {(animation) => (
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
            backgroundColor: 'rgba(0,0,0,0.2)',
            opacity: animation.value,
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
              scale: animation.value.to([0, 1], [0.5, 1]),
            }}
          >
            <button onClick={onClose}>CLOSE MODAL</button>
            <div>MODAL CONTENT</div>
          </animate.div>
        </animate.div>
      )}
    </MountedBlock>
  );
};

export const ModalComp = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button onClick={() => setModalOpen(true)}>OPEN MODAL</button>
      <Modal visible={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};
