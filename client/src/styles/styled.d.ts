import 'styled-components';

// Re-declare the theme shape here to avoid cross-project reference issues
declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      accent: string;
      accentHover: string;
      accentLight: string;
      header: string;
      headerHover: string;
      background: string;
      surface: string;
      surfaceHover: string;
      surfaceGlass: string;
      surfaceGlassLight: string;
      text: string;
      textSecondary: string;
      textMuted: string;
      textInverse: string;
      border: string;
      borderFocus: string;
      danger: string;
      dangerHover: string;
      success: string;
      warning: string;
      info: string;
    };
    spacing: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
    };
    fontSize: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    borderRadius: {
      sm: number;
      md: number;
      lg: number;
      xl: number;
      full: number;
    };
    shadow: {
      sm: string;
      md: string;
      lg: string;
    };
    zIndex: {
      sidebar: number;
      header: number;
      modal: number;
      tooltip: number;
    };
  }
}
