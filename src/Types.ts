export type MeasurementValue = number | Array<number>;

export type MeasurementType = {
  left: MeasurementValue;
  top: MeasurementValue;
  width: MeasurementValue;
  height: MeasurementValue;
  vLeft: MeasurementValue;
  vTop: MeasurementValue;
};

export type WindowDimensionType = {
  width: number;
  height: number;
  innerWidth: number;
  innerHeight: number;
};

type GenericEventType = {
  velocityX: number;
  velocityY: number;
  directionX: number;
  directionY: number;
};

export type ScrollEventType = {
  isScrolling: boolean;
  scrollX: number;
  scrollY: number;
} & GenericEventType;

export type WheelEventType = {
  target: HTMLElement | undefined | null;
  isWheeling: boolean;
  movementX: number;
  movementY: number;
  offsetX: number;
  offsetY: number;
  deltaX: number;
  deltaY: number;
} & GenericEventType;

export type DragEventType = {
  args: Array<number | undefined>;
  down: boolean;
  movementX: number;
  movementY: number;
  offsetX: number;
  offsetY: number;
  distanceX: number;
  distanceY: number;
  cancel: () => void;
} & GenericEventType;

export type MouseMoveEventType = {
  target: EventTarget | undefined | null;
  isMoving: boolean;
  mouseX: number;
  mouseY: number;
} & GenericEventType;

export type UseDragConfig = {
  initial?: () => { movementX: number; movementY: number };
};

export type Vector2 = { x: number; y: number };
