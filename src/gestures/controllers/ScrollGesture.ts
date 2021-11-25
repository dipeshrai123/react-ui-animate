import { attachEvents } from "../eventAttacher";
import { Vector2 } from "../types";
import { clamp } from "../math";
import { withDefault } from "../withDefault";
import { Gesture } from "./Gesture";

export class ScrollGesture extends Gesture {
  isActiveID?: any;
  movement: Vector2 = withDefault(0, 0);
  previousMovement: Vector2 = withDefault(0, 0);
  direction: Vector2 = withDefault(0, 0);
  velocity: Vector2 = withDefault(0, 0);

  // @override
  // initialize the events
  _initEvents() {
    if (this.targetElement) {
      this._subscribe = attachEvents(
        [this.targetElement],
        [["scroll", this.scrollElementListener.bind(this)]]
      );
    } else {
      this._subscribe = attachEvents(
        [window],
        [["scroll", this.scrollListener.bind(this)]]
      );
    }
  }

  _handleCallback() {
    if (this.callback) {
      this.callback({
        isScrolling: this.isActive,
        scrollX: this.movement.x,
        scrollY: this.movement.y,
        velocityX: this.velocity.x,
        velocityY: this.velocity.y,
        directionX: this.direction.x,
        directionY: this.direction.y,
      });
    }
  }

  onScroll({ x, y }: Vector2) {
    const now: number = Date.now();
    const deltaTime = Math.min(now - this.lastTimeStamp, 64);
    this.lastTimeStamp = now;
    const t = deltaTime / 1000; // seconds

    this.movement = { x, y };

    // Clear if scrolling
    if (this.isActiveID !== -1) {
      this.isActive = true;
      clearTimeout(this.isActiveID);
    }

    this.isActiveID = setTimeout(() => {
      this.isActive = false;
      this.direction = { x: 0, y: 0 };

      // Reset Velocity
      this.velocity = { x: 0, y: 0 };

      this._handleCallback(); // Debounce 250milliseconds
    }, 250);

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

    this.previousMovement = {
      x: this.movement.x,
      y: this.movement.y,
    };

    this._handleCallback();
  }

  scrollListener() {
    const { pageYOffset: y, pageXOffset: x } = window;
    this.onScroll({ x, y });
  }

  scrollElementListener() {
    const x = this.targetElement?.scrollLeft || 0;
    const y = this.targetElement?.scrollTop || 0;
    this.onScroll({ x, y });
  }
}
