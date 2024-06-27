import { styleTrasformKeys } from '../react/TransformStyles';
import { FluidValue } from './animation';

export type AnimationTypes = 'spring' | 'timing';

export type AnimatedCSSProperties = {
  [key in keyof React.CSSProperties]: React.CSSProperties[key] | any;
} & {
  [key in (typeof styleTrasformKeys)[number]]?:
    | number
    | string
    | FluidValue
    | any;
};

export type AnimatedHTMLAttributes<T> = {
  [property in keyof React.HTMLAttributes<T>]:
    | React.HTMLAttributes<T>[property]
    | FluidValue
    | any;
};

export type AnimatedSVGAttributes<T> = {
  [property in keyof React.SVGAttributes<T>]:
    | React.SVGAttributes<T>[property]
    | FluidValue
    | any;
};

export type AnimatedProps<T> = Omit<
  AnimatedHTMLAttributes<T> & AnimatedSVGAttributes<T>,
  'style'
> & {
  style?: AnimatedCSSProperties;
};

export type WrappedComponentOrTag =
  | React.ComponentType<any>
  | keyof JSX.IntrinsicElements;
