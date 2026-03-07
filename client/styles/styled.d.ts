import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    colors: {
      primary: string;
      primaryHover: string;
      primaryLight: string;

      textPrimary: string;
      textSecondary: string;
      textMuted: string;

      background: string;
      card: string;

      border: string;
      borderLight: string;

      success: string;
      warning: string;
      danger: string;
      info: string;
    };
  }
}