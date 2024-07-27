import { useLayoutEffect } from 'react';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';

import Header from './Header';

// Examples
import { Draggable } from './components/Draggable';
import { Gestures } from './components/Gestures';
import { Interpolation } from './components/Interpolation';
import { Loop } from './components/Loop';
import { Mounted } from './components/MountedBlock';
import { MouseMove } from './components/MouseMove';
import { DynamicAnimation } from './components/DynamicAnimation';
import { Scroll } from './components/Scroll';
import { SCBlock } from './components/ScrollableBlock';
import { SnapTo } from './components/SnapTo';
import { SVGLine } from './components/svgLine';
import { TBExample } from './components/TransitionBlock';
import { UseAnimatedValue } from './components/useAnimatedValue';
import { UseMountedValue } from './components/useMountedValue';
import { Wheel } from './components/Wheel';
import { SequenceTransition } from './components/SequenceTransition';
import { Decay } from './components/Decay';
import { SharedElement } from './components/SharedElement';
import { ArrayValues } from './components/ArrayValues';
import { Sorting } from './components/Sorting';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        path: '/draggable',
        element: <Draggable />,
      },
      {
        path: '/gestures',
        element: <Gestures />,
      },
      {
        path: '/interpolation',
        element: <Interpolation />,
      },
      {
        path: '/loop',
        element: <Loop />,
      },
      {
        path: '/mountedblock',
        element: <Mounted />,
      },
      {
        path: '/mousemove',
        element: <MouseMove />,
      },
      {
        path: '/dynamicanimation',
        element: <DynamicAnimation />,
      },
      {
        path: '/scroll',
        element: <Scroll />,
      },
      {
        path: '/scrollableblock',
        element: <SCBlock />,
      },
      {
        path: '/snapto',
        element: <SnapTo />,
      },
      {
        path: '/svgline',
        element: <SVGLine />,
      },
      {
        path: '/transitionblock',
        element: <TBExample />,
      },
      {
        path: '/useanimatedvalue',
        element: <UseAnimatedValue />,
      },
      {
        path: '/usemountedvalue',
        element: <UseMountedValue />,
      },
      {
        path: '/wheel',
        element: <Wheel />,
      },
      {
        path: '/sequencetransition',
        element: <SequenceTransition />,
      },
      {
        path: '/decay',
        element: <Decay />,
      },
      {
        path: '/sharedelement',
        element: <SharedElement />,
      },
      {
        path: '/arrayvalues',
        element: <ArrayValues />,
      },
      {
        path: '/sorting',
        element: <Sorting />,
      },
    ],
  },
]);

function Root() {
  return (
    <div>
      <Header />
      <Outlet />
    </div>
  );
}

function App() {
  useLayoutEffect(() => {
    document.body.style.backgroundColor = '#333';
  }, []);

  return <RouterProvider router={router} />;
}

export default App;
