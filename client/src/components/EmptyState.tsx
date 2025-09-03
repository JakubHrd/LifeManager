import { Box, Typography } from "@mui/material";
type Props = { title: string; description?: string; action?: React.ReactNode };
export default function EmptyState({ title, description, action }: Props) {
  return (
    <Box sx={{ textAlign: "center", py: 6 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>{title}</Typography>
      {description && <Typography color="text.secondary" sx={{ mb: 2 }}>{description}</Typography>}
      {action}
    </Box>
  );
}