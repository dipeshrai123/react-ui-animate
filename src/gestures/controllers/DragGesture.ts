import { clamp } from '../../utils';
import { attachEvents } from '../helpers/eventAttacher';
import { withDefault } from '../helpers/withDefault';
import { Gesture } from './Gesture';

import type { Vector2 } from '../types';

export class DragGesture extends Gesture {
  movementStart: Vector2 = withDefault(0, 0);
  initialMovement: Vector2 = withDefault(0, 0);
  movement: Vector2 = withDefault(0, 0);
  previousMovement: Vector2 = withDefault(0, 0);
  translation: Vector2 = withDefault(0, 0);
  offset: Vector2 = withDefault(0, 0);
  velocity: Vector2 = withDefault(0, 0);

  // @override
  // initialize the events
  _initEvents() {
    if (this.targetElement || this.targetElements.length > 0) {
      this._subscribe = attachEvents(
        [window],
        [
          ['mousedown', this.pointerDown.bind(this)],
          ['mousemove', this.pointerMove.bind(this)],
          ['mouseup', this.pointerUp.bind(this)],
          ['touchstart', this.pointerDown.bind(this), { passive: false }],
          ['touchmove', this.pointerMove.bind(this), { passive: false }],
          ['touchend', this.pointerUp.bind(this)],
        ]
      );
    }
  }

  // @override - cancel events
  // we only canceled down and move events because mouse up
  // will not be triggered
  _cancelEvents() {
    if (this._subscribe) {
      this._subscribe(['mousedown', 'mousemove', 'touchstart', 'touchmove']);
    }
  }

  _handleCallback() {
    if (this.callback) {
      this.callback({
        args: [this.currentIndex],
        down: this.isActive,
        movementX: this.movement.x,
        movementY: this.movement.y,
        offsetX: this.translation.x,
        offsetY: this.translation.y,
        velocityX: this.velocity.x,
        velocityY: this.velocity.y,
        distanceX: Math.abs(this.movement.x),
        distanceY: Math.abs(this.movement.y),
        directionX: Math.sign(this.movement.x),
        directionY: Math.sign(this.movement.y),
        cancel: () => {
          this._cancelEvents();
        },
      });
    }
  }

  pointerDown(e: any) {
    if (e.type === 'touchstart') {
      this.movementStart = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    } else {
      this.movementStart = { x: e.clientX, y: e.clientY };
    }

    this.movement = { x: 0, y: 0 };
    this.offset = { x: this.translation.x, y: this.translation.y };
    this.previousMovement = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };

    // find current selected element
    const currElem = this.targetElements.find((elem: any) => elem === e.target);

    if (e.target === this.targetElement || currElem) {
      this.isActive = true;
      e.preventDefault();

      // set args
      if (currElem) {
        this.currentIndex = this.targetElements.indexOf(currElem);
      }

      // if initial function is defined then call it to get initial movementX and movementY
      // if only select to bounded draggable element
      const initial = this.config?.initial && this.config.initial();
      const initialMovementX = initial?.movementX;
      const initialMovementY = initial?.movementY;

      this.initialMovement = {
        x: initialMovementX ?? 0,
        y: initialMovementY ?? 0,
      };

      this.movement = {
        x: this.initialMovement.x,
        y: this.initialMovement.y,
      };

      this.previousMovement = {
        x: this.initialMovement.x,
        y: this.initialMovement.y,
      };

      this._handleCallback();
    }
  }

  pointerMove(e: any) {
    if (this.isActive) {
      e.preventDefault();
      const now = Date.now();
      const deltaTime = clamp(now - this.lastTimeStamp, 0.1, 64);
      this.lastTimeStamp = now;

      const t = deltaTime / 1000;

      if (e.type === 'touchmove') {
        this.movement = {
          x:
            this.initialMovement.x +
            (e.touches[0].clientX - this.movementStart.x),
          y:
            this.initialMovement.y +
            (e.touches[0].clientY - this.movementStart.y),
        };
      } else {
        this.movement = {
          x: this.initialMovement.x + (e.clientX - this.movementStart.x),
          y: this.initialMovement.y + (e.clientY - this.movementStart.y),
        };
      }

      this.translation = {
        x: this.offset.x + this.movement.x,
        y: this.offset.y + this.movement.y,
      };

      this.velocity = {
        x: clamp(
          (this.movement.x - this.previousMovement.x) / t / 1000,
          -1 * Gesture._VELOCITY_LIMIT,
          Gesture._VELOCITY_LIMIT
        ),
        y: clamp(
          (this.movement.y - this.previousMovement.y) / t / 1000,
          -1 * Gesture._VELOCITY_LIMIT,
          Gesture._VELOCITY_LIMIT
        ),
      };

      this.previousMovement = {
        x: this.movement.x,
        y: this.movement.y,
      };

      this._handleCallback();
    }
  }

  pointerUp() {
    if (this.isActive) {
      this.isActive = false;
      this._handleCallback();
      this._cancelEvents();
      this._initEvents();
    }
  }
}
