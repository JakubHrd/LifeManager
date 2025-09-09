export const tokens = {
  palette: {
    primary: { main: "#2D6AE3", light: "#5A8AF0", dark: "#1E4DB1", contrastText: "#FFFFFF" },
    secondary:{ main: "#8B5CF6", light: "#A78BFA", dark: "#6D28D9", contrastText: "#FFFFFF" },
    success:  { main: "#2E7D32" },
    warning:  { main: "#ED6C02" },
    error:    { main: "#D32F2F" },
    info:     { main: "#0288D1" },
    neutral: {
      0:"#0B0D12", 50:"#111827", 100:"#1F2937", 200:"#374151",
      300:"#4B5563", 400:"#6B7280", 500:"#9CA3AF", 600:"#D1D5DB",
      700:"#E5E7EB", 800:"#F3F4F6", 900:"#FFFFFF"
    },
    background: { light: "#F7F9FC", dark: "#0B0D12" }
  },
  radius: { xs: 6, sm: 10, md: 14, lg: 20, xl: 28 },
  spacing: (factor: number) => `${0.25 * factor}rem`,
  shadows: {
    sm: "0 1px 2px rgba(0,0,0,0.06)",
    md: "0 4px 12px rgba(0,0,0,0.08)",
    lg: "0 12px 24px rgba(0,0,0,0.12)"
  },
  typography: {
    fontFamily: `'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif`,
    h1: { fontSize: 34, fontWeight: 700, lineHeight: 1.2 },
    h2: { fontSize: 28, fontWeight: 700, lineHeight: 1.25 },
    h3: { fontSize: 22, fontWeight: 600, lineHeight: 1.3 },
    body1: { fontSize: 16, lineHeight: 1.6 },
    body2: { fontSize: 14, lineHeight: 1.6 },
    button: { textTransform: "none", fontWeight: 600 }
  }
} as const;
