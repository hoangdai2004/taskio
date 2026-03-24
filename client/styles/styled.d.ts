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

    colors2: {
      textPrimary: string;
      textSecondary: string;

      primary: string;
      primaryHover: string;

      border: string;
      borderLight: string;

      background: string;
      surface: string;

      todo: string;
      inProgress: string;
      review: string;
      done: string;

      success: string;
      danger: string;
    };
    radius: {
      default: string;
    }
    gradients: {
      main: string;
    }
  }
}
