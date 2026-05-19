// Tipagem para o Design System do Aerocode - Precision Industrial Aesthetic

export type ColorPalette = 
  | 'primary' | 'primary-container' | 'on-primary' | 'primary-fixed' | 'primary-fixed-dim' | 'on-primary-fixed' | 'on-primary-fixed-variant' | 'on-primary-container'
  | 'secondary' | 'secondary-container' | 'on-secondary' | 'secondary-fixed' | 'secondary-fixed-dim' | 'on-secondary-fixed' | 'on-secondary-fixed-variant' | 'on-secondary-container'
  | 'tertiary' | 'tertiary-container' | 'on-tertiary' | 'tertiary-fixed' | 'tertiary-fixed-dim' | 'on-tertiary-fixed' | 'on-tertiary-fixed-variant' | 'on-tertiary-container'
  | 'error' | 'error-container' | 'on-error' | 'on-error-container'
  | 'surface' | 'surface-dim' | 'surface-bright' | 'surface-variant' | 'surface-tint'
  | 'surface-container-lowest' | 'surface-container-low' | 'surface-container' | 'surface-container-high' | 'surface-container-highest'
  | 'on-surface' | 'on-surface-variant'
  | 'background' | 'on-background'
  | 'outline' | 'outline-variant'
  | 'inverse-surface' | 'inverse-primary' | 'inverse-on-surface';

export type TypographySize = 'h1' | 'h2' | 'h3' | 'body-lg' | 'body-md' | 'body-sm' | 'label-md' | 'label-sm' | 'code';
export type Spacing = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'gutter' | 'margin';
export type Shape = 'DEFAULT' | 'lg' | 'xl' | 'full';

export interface ThemeConfig {
  colors: Record<ColorPalette, string>;
  spacing: Record<Spacing, string>;
  borderRadius: Record<Shape, string>;
}
