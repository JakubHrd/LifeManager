import { createTheme } from '@mui/material/styles';

function readVar(name: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v;
}
function readInt(name: string, fallback: number) {
  const n = parseInt(readVar(name), 10);
  return Number.isFinite(n) ? n : fallback;
}

export function createMuiThemeFromTokens() {
  const bg = readVar('--lm-bg') || '#ffffff';
  const isLight = bg.toLowerCase() === '#ffffff' || bg.startsWith('rgb(255');
  const baseFont = readInt('--lm-font-size', 16);
  const spacing = readInt('--lm-spacing', 8);
  const radius = readInt('--lm-radius', 16);

  return createTheme({
    cssVariables: true, // MUI v6: generuje CSS var pro theme (fajn pro budoucno)
    palette: {
      mode: isLight ? 'light' : 'dark',
      primary: { main: readVar('--lm-color-primary') || '#5ac8fa' },
      secondary: { main: readVar('--lm-color-secondary') || '#a78bfa' },
      success: { main: readVar('--lm-color-success') || '#22c55e' },
      warning: { main: readVar('--lm-color-warning') || '#f59e0b' },
      error:   { main: readVar('--lm-color-error')   || '#ef4444' },
      background: {
        default: readVar('--lm-bg')      || (isLight ? '#fff' : '#0b0e11'),
        paper:   readVar('--lm-surface') || (isLight ? '#f7f8fa' : '#12161a'),
      },
      text: { primary: readVar('--lm-text') || (isLight ? '#111827' : '#e7e9ea') }
    },
    shape: { borderRadius: radius },
    spacing,
    typography: {
      fontFamily: `var(--lm-font-family)`,
      fontSize: baseFont, // MUI bere jako px základ (10–14–16 typicky)
      h1: { fontWeight: 700, lineHeight: 1.15 },
      h2: { fontWeight: 700, lineHeight: 1.2 },
      h3: { fontWeight: 700, lineHeight: 1.25 },
      button: { textTransform: 'none', fontWeight: 600 }
    },
    components: {
      MuiPaper: { styleOverrides: { root: { boxShadow: 'var(--lm-shadow-1)' } } },
      MuiCard:  { styleOverrides: { root: { boxShadow: 'var(--lm-shadow-2)' } } },
      MuiButton: {
        defaultProps: { variant: 'contained' },
        styleOverrides: { root: { borderRadius: radius } }
      },
      MuiContainer: { defaultProps: { maxWidth: 'lg' } }
    }
  });
}
