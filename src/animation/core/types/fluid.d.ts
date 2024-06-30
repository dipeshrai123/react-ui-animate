import { FluidValue } from '../controllers/FluidValue';
import { styleTrasformKeys } from '../react/transforms';

export type FluidTypes = 'spring' | 'timing';

export type FluidCSSProperties = {
  [key in keyof React.CSSProperties]: React.CSSProperties[key];
} & {
  [key in (typeof styleTrasformKeys)[number]]?: number | string | FluidValue;
};

export type FluidHTMLAttributes<T> = {
  [property in keyof React.HTMLAttributes<T>]:
    | React.HTMLAttributes<T>[property]
    | FluidValue;
};

export type FluidSVGAttributes<T> = {
  [property in keyof React.SVGAttributes<T>]:
    | React.SVGAttributes<T>[property]
    | FluidValue;
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
