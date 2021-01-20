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

export type ScrollEventType = {
  isScrolling: boolean;
  scrollX: number;
  scrollY: number;
  velocityX: number;
  velocityY: number;
  directionX: number;
  directionY: number;
};

export type DragEventType = {
  args: Array<number | undefined>;
  down: boolean;
  movementX: number;
  movementY: number;
  offsetX: number;
  offsetY: number;
  velocityX: number;
  velocityY: number;
  distanceX: number;
  distanceY: number;
  directionX: number;
  directionY: number;
  cancel: () => void;
};

export type Vector2 = { x: number; y: number };
