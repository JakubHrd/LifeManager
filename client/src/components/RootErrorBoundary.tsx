import { Component, ReactNode } from "react";
import { Button, Container, Typography } from "@mui/material";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export default class RootErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h5" sx={{ mb: 1 }}>Něco se pokazilo</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>Zkuste to prosím znovu.</Typography>
        <Button onClick={() => location.reload()} variant="contained">Obnovit stránku</Button>
      </Container>
    );
  }
}
