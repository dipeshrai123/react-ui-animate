/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * https://github.com/gre/bezier-easing
 * BezierEasing - use bezier curve for transition easing function
 * by Gaëtan Renaudeau 2014 - 2015 – MIT License
 */

const NEWTON_ITERATIONS = 4;
const NEWTON_MIN_SLOPE = 0.001;
const SUBDIVISION_PRECISION = 0.0000001;
const SUBDIVISION_MAX_ITERATIONS = 10;

const kSplineTableSize = 11;
const kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

const float32ArraySupported = typeof Float32Array === "function";

function A(aA1: number, aA2: number) {
  return 1.0 - 3.0 * aA2 + 3.0 * aA1;
}
function B(aA1: number, aA2: number) {
  return 3.0 * aA2 - 6.0 * aA1;
}
function C(aA1: number) {
  return 3.0 * aA1;
}

function calcBezier(aT: number, aA1: number, aA2: number) {
  return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
}

function getSlope(aT: number, aA1: number, aA2: number) {
  return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
}

function binarySubdivide(
  aX: number,
  aA: number,
  aB: number,
  mX1: number,
  mX2: number
) {
  let currentX,
    currentT,
    i = 0;
  do {
    currentT = aA + (aB - aA) / 2.0;
    currentX = calcBezier(currentT, mX1, mX2) - aX;
    if (currentX > 0.0) {
      aB = currentT;
    } else {
      aA = currentT;
    }
  } while (
    Math.abs(currentX) > SUBDIVISION_PRECISION &&
    ++i < SUBDIVISION_MAX_ITERATIONS
  );
  return currentT;
}

function newtonRaphsonIterate(
  aX: number,
  aGuessT: number,
  mX1: number,
  mX2: number
) {
  for (let i = 0; i < NEWTON_ITERATIONS; ++i) {
    const currentSlope = getSlope(aGuessT, mX1, mX2);
    if (currentSlope === 0.0) {
      return aGuessT;
    }
    const currentX = calcBezier(aGuessT, mX1, mX2) - aX;
    aGuessT -= currentX / currentSlope;
  }
  return aGuessT;
}

function LinearEasing(x: number) {
  return x;
}

function bezier(mX1: number, mY1: number, mX2: number, mY2: number) {
  if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) {
    throw new Error("bezier x values must be in [0, 1] range");
  }

  if (mX1 === mY1 && mX2 === mY2) {
    return LinearEasing;
  }

  const sampleValues = float32ArraySupported
    ? new Float32Array(kSplineTableSize)
    : new Array(kSplineTableSize);
  for (let i = 0; i < kSplineTableSize; ++i) {
    sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
  }

  function getTForX(aX: number) {
    let intervalStart = 0.0;
    let currentSample = 1;
    const lastSample = kSplineTableSize - 1;

    for (
      ;
      currentSample !== lastSample && sampleValues[currentSample] <= aX;
      ++currentSample
    ) {
      intervalStart += kSampleStepSize;
    }
    --currentSample;

    const dist =
      (aX - sampleValues[currentSample]) /
      (sampleValues[currentSample + 1] - sampleValues[currentSample]);
    const guessForT = intervalStart + dist * kSampleStepSize;

    const initialSlope = getSlope(guessForT, mX1, mX2);
    if (initialSlope >= NEWTON_MIN_SLOPE) {
      return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
    } else if (initialSlope === 0.0) {
      return guessForT;
    } else {
      return binarySubdivide(
        aX,
        intervalStart,
        intervalStart + kSampleStepSize,
        mX1,
        mX2
      );
    }
  }

  return function BezierEasing(x: number) {
    if (x === 0 || x === 1) {
      return x;
    }
    return calcBezier(getTForX(x), mY1, mY2);
  };
}

export class Easing {
  static step0(n: number) {
    return n > 0 ? 1 : 0;
  }

  static step1(n: number) {
    return n >= 1 ? 1 : 0;
  }

  static linear(t: number) {
    return t;
  }

  static ease(t: number): number {
    return ease(t);
  }

  static quad(t: number) {
    return t * t;
  }

  static cubic(t: number) {
    return t * t * t;
  }

  static poly(n: number) {
    return (t: number) => Math.pow(t, n);
  }

  static sin(t: number) {
    return 1 - Math.cos((t * Math.PI) / 2);
  }

  static circle(t: number) {
    return 1 - Math.sqrt(1 - t * t);
  }

  static exp(t: number) {
    return Math.pow(2, 10 * (t - 1));
  }

  static elastic(bounciness: number = 1): (t: number) => number {
    const p = bounciness * Math.PI;
    return (t) =>
      1 - Math.pow(Math.cos((t * Math.PI) / 2), 3) * Math.cos(t * p);
  }

  static back(s: number): (t: number) => number {
    if (s === undefined) {
      s = 1.70158;
    }
    return (t) => t * t * ((s + 1) * t - s);
  }

  static bounce(t: number): number {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    }

    if (t < 2 / 2.75) {
      t -= 1.5 / 2.75;
      return 7.5625 * t * t + 0.75;
    }

    if (t < 2.5 / 2.75) {
      t -= 2.25 / 2.75;
      return 7.5625 * t * t + 0.9375;
    }

    t -= 2.625 / 2.75;
    return 7.5625 * t * t + 0.984375;
  }

  static bezier(
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): (t: number) => number {
    return bezier(x1, y1, x2, y2);
  }

  static in(easing: (t: number) => number): (t: number) => number {
    return easing;
  }

  static out(easing: (t: number) => number): (t: number) => number {
    return (t) => 1 - easing(1 - t);
  }

  static inOut(easing: (t: number) => number): (t: number) => number {
    return (t) => {
      if (t < 0.5) {
        return easing(t * 2) / 2;
      }
      return 1 - easing((1 - t) * 2) / 2;
    };
  }
}

const ease = /*#__PURE__*/ Easing.bezier(0.42, 0, 1, 1);

