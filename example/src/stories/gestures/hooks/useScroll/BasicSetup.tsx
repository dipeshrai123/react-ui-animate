import { useScroll } from 'react-ui-animate';

const Example = () => {
  useScroll(window, function (event) {
    console.log('Scroll', event);
  });

  return <div style={{ height: 2000 }} />;
};

export default Example;
