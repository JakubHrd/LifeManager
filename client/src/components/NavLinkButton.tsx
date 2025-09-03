import { Button, ButtonProps } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";
type Props = ButtonProps & { to: string; exact?: boolean };
export default function NavLinkButton({ to, exact, ...rest }: Props) {
  const { pathname } = useLocation();
  const active = exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");
  return <Button component={RouterLink} to={to} variant={active ? "contained" : "text"} color="inherit" {...rest} />;
}
