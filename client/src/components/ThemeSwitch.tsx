import { IconButton, Tooltip } from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useTheme } from "@mui/material/styles";
import { useColorMode } from "./ColorSchemeProvider";

export default function ThemeSwitch() {
  const theme = useTheme();
  const { toggle } = useColorMode();
  const isLight = theme.palette.mode === "light";
  return (
    <Tooltip title={isLight ? "Dark mode" : "Light mode"}>
      <IconButton onClick={toggle} size="small" aria-label="toggle color mode">
        {isLight ? <DarkModeIcon /> : <LightModeIcon />}
      </IconButton>
    </Tooltip>
  );
}
