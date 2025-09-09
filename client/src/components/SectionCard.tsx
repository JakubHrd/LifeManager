import { Card, CardContent, CardHeader } from "@mui/material";
type Props = { title?: string; action?: React.ReactNode; children: React.ReactNode };
export default function SectionCard({ title, action, children }: Props) {
  return (
    <Card>
      {title && <CardHeader title={title} action={action} />}
      <CardContent>{children}</CardContent>
    </Card>
  );
}
