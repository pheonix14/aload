// ALoad Typography System
import { TextStyle } from 'react-native';

export const FontFamily = {
  regular: 'System',
  medium:  'System',
  bold:    'System',
  mono:    'monospace',
};

export const FontSize = {
  xs:   10,
  sm:   12,
  base: 14,
  md:   16,
  lg:   18,
  xl:   20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 34,
};

export const Typography: Record<string, TextStyle> = {
  displayLarge: { fontSize: FontSize['4xl'], fontWeight: '800', letterSpacing: -0.5 },
  displayMedium:{ fontSize: FontSize['3xl'], fontWeight: '700', letterSpacing: -0.25 },
  titleLarge:   { fontSize: FontSize.xl,    fontWeight: '700' },
  titleMedium:  { fontSize: FontSize.lg,    fontWeight: '600' },
  titleSmall:   { fontSize: FontSize.md,    fontWeight: '600' },
  bodyLarge:    { fontSize: FontSize.md,    fontWeight: '400' },
  bodyMedium:   { fontSize: FontSize.base,  fontWeight: '400' },
  bodySmall:    { fontSize: FontSize.sm,    fontWeight: '400' },
  labelLarge:   { fontSize: FontSize.base,  fontWeight: '500', letterSpacing: 0.1 },
  labelSmall:   { fontSize: FontSize.xs,    fontWeight: '500', letterSpacing: 0.5 },
  caption:      { fontSize: FontSize.xs,    fontWeight: '400', letterSpacing: 0.4 },
  mono:         { fontSize: FontSize.sm,    fontFamily: FontFamily.mono },
};
