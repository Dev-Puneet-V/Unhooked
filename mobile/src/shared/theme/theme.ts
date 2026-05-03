import {scale, verticalScale} from './scaling';

export const theme = {
  colors: {
    background: '#f7f8fb',
    surface: '#ffffff',
    textPrimary: '#111827',
    textSecondary: '#273247',
    textMuted: '#5e687b',
    textSubtle: '#647084',
    textPlaceholder: '#8a94a6',
    border: '#d7dce5',
    primary: '#2563eb',
    onPrimary: '#ffffff',
  },
  spacing: {
    xs: scale(4),
    sm: scale(8),
    md: scale(12),
    lg: scale(14),
    xl: scale(18),
    '2xl': scale(24),
    '3xl': verticalScale(36),
  },
  radius: {
    sm: scale(8),
  },
  typography: {
    size: {
      xs: scale(13),
      sm: scale(14),
      md: scale(15),
      lg: scale(16),
      xl: scale(18),
      '2xl': scale(22),
      brand: scale(34),
    },
    lineHeight: {
      sm: scale(19),
      md: scale(22),
    },
    weight: {
      semibold: '600',
      bold: '700',
      extraBold: '800',
    },
  },
  control: {
    height: verticalScale(52),
    borderWidth: 1,
  },
} as const;
