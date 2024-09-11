import {
  rgbaToHex,
  hexToRgba,
  COLOR_NUMBER_REGEX,
  HEX_NAME_COLOR,
  colorNames,
} from './colors';

type ExtrapolateType = 'identity' | 'extend' | 'clamp';

type ExtrapolateConfig = {
  extrapolate?: ExtrapolateType;
  extrapolateLeft?: ExtrapolateType;
  extrapolateRight?: ExtrapolateType;
};

const interpolateValue = (
  val: number,
  arr: any,
  extrapolateLeft: ExtrapolateType,
  extrapolateRight: ExtrapolateType
) => {
  const [inputMin, inputMax, outputMin, outputMax] = arr;
  let result: number = val;

  // EXTRAPOLATE
  if (result < inputMin) {
    if (extrapolateLeft === 'identity') {
      return result;
    } else if (extrapolateLeft === 'clamp') {
      result = inputMin;
    } else if (extrapolateLeft === 'extend') {
      // noop
    }
  }

  if (result > inputMax) {
    if (extrapolateRight === 'identity') {
      return result;
    } else if (extrapolateRight === 'clamp') {
      result = inputMax;
    } else if (extrapolateRight === 'extend') {
      // noop
    }
  }

  if (outputMin === outputMax) {
    return outputMin;
  }

  if (inputMin === inputMax) {
    if (val <= inputMin) {
      return outputMin;
    }
    return outputMax;
  }

  // Input Range
  if (inputMin === -Infinity) {
    result = -result;
  } else if (inputMax === Infinity) {
    result = result - inputMin;
  } else {
    result = (result - inputMin) / (inputMax - inputMin);
  }

  // Output Range
  if (outputMin === -Infinity) {
    result = -result;
  } else if (outputMax === Infinity) {
    result = result + outputMin;
  } else {
    result = result * (outputMax - outputMin) + outputMin;
  }

  return result;
};

const getNarrowedInput = function (
  x: number,
  input: number[],
  output: Array<number | string>
): Array<number | string> {
  const length = input.length;
  let narrowedInput: Array<number | string> = [];

  // Boundaries
  if (x < input[0]) {
    narrowedInput = [input[0], input[1], output[0], output[1]];
  } else if (x > input[length - 1]) {
    narrowedInput = [
      input[length - 2],
      input[length - 1],
      output[length - 2],
      output[length - 1],
    ];
  }

  // Narrow the input and output ranges
  for (let i = 1; i < length; ++i) {
    if (x <= input[i]) {
      narrowedInput = [input[i - 1], input[i], output[i - 1], output[i]];
      break;
    }
  }

  return narrowedInput;
};

const interpolateColor = (value: number, narrowedInput: string[]) => {
  const [inputMin, inputMax, outputMin, outputMax] = narrowedInput;

  const outputMinProcessed = hexToRgba(outputMin);
  const outputMaxProcessed = hexToRgba(outputMax);

  const red = interpolateValue(
    value,
    [inputMin, inputMax, outputMinProcessed.r, outputMaxProcessed.r],
    'clamp',
    'clamp'
  );

  const green = interpolateValue(
    value,
    [inputMin, inputMax, outputMinProcessed.g, outputMaxProcessed.g],
    'clamp',
    'clamp'
  );

  const blue = interpolateValue(
    value,
    [inputMin, inputMax, outputMinProcessed.b, outputMaxProcessed.b],
    'clamp',
    'clamp'
  );

  const alpha = interpolateValue(
    value,
    [inputMin, inputMax, outputMinProcessed.a, outputMaxProcessed.a],
    'clamp',
    'clamp'
  );

  return rgbaToHex({ r: red, g: green, b: blue, a: alpha });
};

const _getArrayInterpolate = (
  value: number,
  narrowedInput: Array<any>,
  _extrapolateLeft: ExtrapolateType,
  _extrapolateRight: ExtrapolateType
) => {
  const [inputMin, inputMax, outputMin, outputMax] = narrowedInput;

  if (outputMin.length === outputMax.length) {
    return outputMin.map((val: any, index: number) => {
      if (typeof val === 'string') {
        // IF IT IS STRING THEN IT MUST BE HEX COLOR
        return interpolateColor(value, [
          inputMin,
          inputMax,
          val,
          outputMax[index],
        ]);
      } else {
        return interpolateValue(
          value,
          [inputMin, inputMax, val, outputMax[index]],
          _extrapolateLeft,
          _extrapolateRight
        );
      }
    });
  } else {
    throw new Error("Array length doesn't match");
  }
};

const getTemplateString = (str: string) => {
  return str.replace(COLOR_NUMBER_REGEX, '$');
};

const _getParsedStringArray = (str: any) => {
  return str.match(COLOR_NUMBER_REGEX).map((v: string) => {
    if (v.indexOf('#') !== -1) {
      return v;
    } else {
      return Number(v);
    }
  });
};

const stringMatched = (str1: string, str2: string) =>
  getTemplateString(str1).trim().replace(/\s/g, '') ===
  getTemplateString(str2).trim().replace(/\s/g, '');

/**
 * Function which proccess the
 * hexadecimal colors to its proper formats
 * @param str - string
 * @returns hex color string
 */
const getProcessedColor = (str: string) => {
  return str.replace(HEX_NAME_COLOR, function (match: any) {
    if (match.indexOf('#') !== -1) {
      return rgbaToHex(hexToRgba(match));
    } else if (Object.prototype.hasOwnProperty.call(colorNames, match)) {
      return colorNames[match];
    } else {
      throw new Error('String cannot be parsed!');
    }
  });
};

export function interpolateNumbers(
  value: number,
  inputRange: Array<number>,
  outputRange: Array<number | string>,
  extrapolateConfig?: ExtrapolateConfig
) {
  const extrapolate = extrapolateConfig?.extrapolate;
  const extrapolateLeft = extrapolateConfig?.extrapolateLeft;
  const extrapolateRight = extrapolateConfig?.extrapolateRight;

  const narrowedInput = getNarrowedInput(value, inputRange, outputRange);

  let _extrapolateLeft: ExtrapolateType = 'extend';
  if (extrapolateLeft !== undefined) {
    _extrapolateLeft = extrapolateLeft;
  } else if (extrapolate !== undefined) {
    _extrapolateLeft = extrapolate;
  }

  let _extrapolateRight: ExtrapolateType = 'extend';
  if (extrapolateRight !== undefined) {
    _extrapolateRight = extrapolateRight;
  } else if (extrapolate !== undefined) {
    _extrapolateRight = extrapolate;
  }

  if (outputRange.length) {
    if (typeof outputRange[0] === 'number') {
      return interpolateValue(
        value,
        narrowedInput,
        _extrapolateLeft,
        _extrapolateRight
      );
    } else if (Array.isArray(outputRange[0])) {
      return _getArrayInterpolate(
        value,
        narrowedInput,
        _extrapolateLeft,
        _extrapolateRight
      );
    } else {
      const [inputMin, inputMax, outputMin, outputMax] = narrowedInput;

      const processedOutputMin = getProcessedColor(outputMin as string);
      const processedOutputMax = getProcessedColor(outputMax as string);

      let templateString = getTemplateString(processedOutputMin);

      if (stringMatched(processedOutputMin, processedOutputMax)) {
        const outputMinParsed = _getParsedStringArray(processedOutputMin);
        const outputMaxParsed = _getParsedStringArray(processedOutputMax);

        const result = _getArrayInterpolate(
          value,
          [inputMin, inputMax, outputMinParsed, outputMaxParsed],
          _extrapolateLeft,
          _extrapolateRight
        );

        for (const v of result) templateString = templateString.replace('$', v);
        return templateString;
      } else {
        throw new Error("Output range doesn't match string format!");
      }
    }
  } else {
    throw new Error('Output range cannot be Empty');
  }
}
