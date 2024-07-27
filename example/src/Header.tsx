import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="header">
      <ul>
        <li>
          <Link to="/draggable">Draggable</Link>
        </li>
        <li>
          <Link to="/gestures">Gestures</Link>
        </li>
        <li>
          <Link to="/interpolation">Interpolation</Link>
        </li>
        <li>
          <Link to="/loop">Loop</Link>
        </li>
        <li>
          <Link to="/mountedblock">MountedBlock</Link>
        </li>
        <li>
          <Link to="/mousemove">Mouse Move</Link>
        </li>
        <li>
          <Link to="/dynamicanimation">Dynamic Animation</Link>
        </li>
        <li>
          <Link to="/scroll">Scroll</Link>
        </li>
        <li>
          <Link to="/scrollableblock">Scrollable Block</Link>
        </li>
        <li>
          <Link to="/snapto">SnapTo</Link>
        </li>
        <li>
          <Link to="/svgline">svgLine</Link>
        </li>
        <li>
          <Link to="/transitionblock">Transition Block</Link>
        </li>
        <li>
          <Link to="/useanimatedvalue">useAnimatedValue</Link>
        </li>
        <li>
          <Link to="/usemountedvalue">useMountedValue</Link>
        </li>
        <li>
          <Link to="/wheel">Wheel</Link>
        </li>
        <li>
          <Link to="/sequencetransition">SequenceTransition</Link>
        </li>
        <li>
          <Link to="/decay">Decay</Link>
        </li>
        <li>
          <Link to="/sharedelement">SharedElement</Link>
        </li>
      </ul>
    </header>
  );
}
