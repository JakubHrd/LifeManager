import { createTheme, responsiveFontSizes } from "@mui/material/styles";
import { tokens } from "./tokens";

declare module "@mui/material/styles" {
  interface Theme { tokens: typeof tokens; }
  interface ThemeOptions { tokens?: typeof tokens; }
}

export type PaletteOverrides = {
  primaryMain?: string; primaryLight?: string; primaryDark?: string;
  secondaryMain?: string; secondaryLight?: string; secondaryDark?: string;
  bgLight?: string; bgDark?: string;
};

export const buildTheme = (mode: "light" | "dark" = "light", ov: PaletteOverrides = {}) => {
  const primary = {
    main: ov.primaryMain ?? tokens.palette.primary.main,
    light: ov.primaryLight ?? tokens.palette.primary.light,
    dark: ov.primaryDark ?? tokens.palette.primary.dark,
    contrastText: tokens.palette.primary.contrastText
  };
  const secondary = {
    main: ov.secondaryMain ?? tokens.palette.secondary.main,
    light: ov.secondaryLight ?? tokens.palette.secondary.light,
    dark: ov.secondaryDark ?? tokens.palette.secondary.dark,
    contrastText: tokens.palette.secondary.contrastText
  };

  const palette =
    mode === "light"
      ? {
          mode,
          primary, secondary,
          background: { default: ov.bgLight ?? tokens.palette.background.light, paper: "#FFFFFF" }
        }
      : {
          mode,
          primary, secondary,
          background: { default: ov.bgDark ?? tokens.palette.background.dark, paper: tokens.palette.neutral[50] },
          text: { primary: tokens.palette.neutral[700], secondary: tokens.palette.neutral[600] }
        };

  let theme = createTheme({
    tokens,
    palette,
    shape: { borderRadius: tokens.radius.lg },
    spacing: tokens.spacing,
    typography: {
      fontFamily: tokens.typography.fontFamily,
      h1: tokens.typography.h1, h2: tokens.typography.h2, h3: tokens.typography.h3,
      body1: tokens.typography.body1, body2: tokens.typography.body2, button: tokens.typography.button
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          ":root": { colorScheme: mode },
          "*, *::before, *::after": { boxSizing: "border-box" },
          body: { margin: 0, minHeight: "100dvh" }
        }
      },
      MuiButton: { defaultProps: { variant: "contained", disableElevation: true } },
      MuiCard:   { defaultProps: { elevation: 0 } }
    }
  });

  theme = responsiveFontSizes(theme);
  return theme;
};
