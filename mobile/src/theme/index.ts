export const theme = {
  colors: {
    primary: '#FF6B6B',
    secondary: '#4ECDC4',
    background: '#FAF7F0',
    card: '#FFFFFF',
    text: '#000000',
    textSecondary: '#666666',
    border: '#000000',
    error: '#FF3B30',
    success: '#4CD964',
    warning: '#FFCC00',
    info: '#5AC8FA',
  },
  fonts: {
    regular: 'SpaceGrotesk_400Regular',
    medium: 'SpaceGrotesk_500Medium',
    bold: 'SpaceGrotesk_700Bold',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    full: 9999,
  },
  shadows: {
    button: {
      offset: { width: 4, height: 4 },
      opacity: 1,
      radius: 0,
    },
    card: {
      offset: { width: 6, height: 6 },
      opacity: 1,
      radius: 0,
    },
  },
};

export type Theme = typeof theme;
