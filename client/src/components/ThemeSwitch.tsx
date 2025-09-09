import { IconButton, Tooltip } from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import SyncRoundedIcon from "@mui/icons-material/SyncRounded";
import { useColorMode } from "./ColorSchemeProvider";

export default function ThemeSwitch() {
  const { mode, effective, cycle } = useColorMode();
  const icon = mode === "system" ? <SyncRoundedIcon /> : (effective === "dark" ? <LightModeIcon /> : <DarkModeIcon sx={{color: "black"  }}/>);
  const label = mode === "system" ? "System" : effective === "dark" ? "Dark" : "Light";

  return (
    <Tooltip title={`Theme: ${label} (click to change)`}>
      <IconButton onClick={cycle} size="small" aria-label="toggle color mode">
        {icon}
      </IconButton>
    </Tooltip>
  );
}
