import { Box, Typography } from "@mui/material";

type Props = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
};

export default function PageHeader({ title, subtitle, actions }: Props) {
  return (
    <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
      <Box sx={{ flex: 1, minWidth: 220 }}>
        <Typography variant="h4">{title}</Typography>
        {subtitle && (
          <Typography variant="subtitle1" color="text.secondary">{subtitle}</Typography>
        )}
      </Box>
      {actions}
    </Box>
  );
}
