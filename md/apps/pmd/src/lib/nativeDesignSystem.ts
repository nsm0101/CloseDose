/**
 * React Native-ready PREtendingMD design primitives.
 *
 * Keep these values as numbers or plain strings so they can move directly into
 * a future React Native StyleSheet without translating Tailwind classes. The
 * web app consumes the same constants for spacing, touch targets and layout
 * breakpoints, making this Vite build the compatibility layer for iOS work.
 */
export const nativeDS = {
  spacing: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  radius: {
    chip: 10,
    control: 14,
    card: 24,
    sheet: 28,
    round: 999,
  },
  touch: {
    minimum: 44,
    comfortable: 52,
    primary: 56,
  },
  board: {
    maxContentWidth: 1180,
    singleColumnWidth: 720,
    cardGap: 12,
    desktopCardMinWidth: 320,
  },
  elevation: {
    card: '0 10px 30px -22px rgba(20,40,68,0.55)',
    floating: '0 20px 45px -24px rgba(20,40,68,0.7)',
  },
} as const;

export type NativeDesignSystem = typeof nativeDS;
