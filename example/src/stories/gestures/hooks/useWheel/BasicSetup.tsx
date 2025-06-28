import { useWheel } from 'react-ui-animate';

const Example = () => {
  useWheel(window, function (event) {
    console.log('Wheel event:', event);
  });

  return <div style={{ height: 2000 }} />;
};

export default Example;
