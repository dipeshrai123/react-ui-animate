import { useRef, useState } from 'react';

import {
  useMount,
  animate,
  useOutsideClick,
  withTiming,
  Config,
} from 'react-ui-animate';

const Modal = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const ref = useRef(null);
  useOutsideClick(ref, onClose);

  const mount = useMount(visible, {
    enter: withTiming(1, { easing: Config.Timing.POWER4.easing }),
    exit: withTiming(0, { easing: Config.Timing.POWER4.easing }),
  });

  return (
    <>
      {mount(
        (a, m) =>
          m && (
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
                opacity: a,
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
                  scale: a.to([0, 1], [0.8, 1]),
                  translateY: a.to([0, 1], [20, 0]),
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
          )
      )}
    </>
  );
};

const Example = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button onClick={() => setModalOpen(true)}>OPEN MODAL</button>
      <Modal visible={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default Example;
