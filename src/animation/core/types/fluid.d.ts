import { styleTrasformKeys } from '../react/transforms';
import { FluidValue } from './animation';

export type FluidTypes = 'spring' | 'timing';

export type FluidCSSProperties = {
  [key in keyof React.CSSProperties]: React.CSSProperties[key] | any;
} & {
  [key in (typeof styleTrasformKeys)[number]]?:
    | number
    | string
    | FluidValue
    | any;
};

export type FluidHTMLAttributes<T> = {
  [property in keyof React.HTMLAttributes<T>]:
    | React.HTMLAttributes<T>[property]
    | FluidValue
    | any;
};

export type FluidSVGAttributes<T> = {
  [property in keyof React.SVGAttributes<T>]:
    | React.SVGAttributes<T>[property]
    | FluidValue
    | any;
};

export type FluidProps<T> = Omit<
  FluidHTMLAttributes<T> & FluidSVGAttributes<T>,
  'style'
> & {
  style?: FluidCSSProperties;
};

export type WrappedComponentOrTag =
  | React.ComponentType<React.HTMLAttributes<HTMLElement>>
  | keyof JSX.IntrinsicElements;
