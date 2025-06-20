import { clamp } from '../../utils';
import { attachEvents } from '../helpers/eventAttacher';
import { Vector2 } from '../types';
import { withDefault } from '../helpers/withDefault';
import { Gesture } from './Gesture';

export class MouseMoveGesture extends Gesture {
  event?: MouseEvent;
  isActiveID?: any;
  movement: Vector2 = withDefault(0, 0);
  previousMovement: Vector2 = withDefault(0, 0);
  velocity: Vector2 = withDefault(0, 0);
  direction: Vector2 = withDefault(0, 0);

  // @override
  // initialize the events
  _initEvents() {
    if (this.targetElement) {
      this._subscribe = attachEvents(
        [this.targetElement],
        [['mousemove', this.onMouseMove.bind(this)]]
      );
    } else if (this.targetElements.length > 0) {
      this._subscribe = attachEvents(this.targetElements, [
        ['mousemove', this.onMouseMove.bind(this)],
      ]);
    } else {
      this._subscribe = attachEvents(
        [window],
        [['mousemove', this.onMouseMove.bind(this)]]
      );
    }
  }

  _handleCallback() {
    if (this.callback) {
      this.callback({
        args: [this.currentIndex],
        event: this.event,
        isMoving: this.isActive,
        target: this.event?.target,
        mouseX: this.movement.x,
        mouseY: this.movement.y,
        velocityX: this.velocity.x,
        velocityY: this.velocity.y,
        directionX: this.direction.x,
        directionY: this.direction.y,
      });
    }
  }

  onMouseMove(e: MouseEvent) {
    // find current selected element
    const currElem = this.targetElements.find((elem: any) => elem === e.target);

    // set args
    if (currElem) {
      this.currentIndex = this.targetElements.indexOf(currElem);
    }

    this.event = e;

    const now: number = Date.now();
    const deltaTime = Math.min(now - this.lastTimeStamp, 64);
    this.lastTimeStamp = now;
    const t = deltaTime / 1000; // seconds

    const x = e.clientX;
    const y = e.clientY;

    this.movement = { x, y };

    if (this.isActiveID !== -1) {
      this.isActive = true;
      clearTimeout(this.isActiveID);
    }

    this.isActiveID = setTimeout(() => {
      this.isActive = false;
      this.direction = { x: 0, y: 0 };
      this.velocity = { x: 0, y: 0 };

      this._handleCallback();
    }, 250); // Debounce 250 milliseconds

    const diffX = this.movement.x - this.previousMovement.x;
    const diffY = this.movement.y - this.previousMovement.y;

    this.direction = {
      x: Math.sign(diffX),
      y: Math.sign(diffY),
    };

    this.velocity = {
      x: clamp(
        diffX / t / 1000,
        -1 * Gesture._VELOCITY_LIMIT,
        Gesture._VELOCITY_LIMIT
      ),
      y: clamp(
        diffY / t / 1000,
        -1 * Gesture._VELOCITY_LIMIT,
        Gesture._VELOCITY_LIMIT
      ),
    };

    this.previousMovement = { x: this.movement.x, y: this.movement.y };

    this._handleCallback();
  }
}
