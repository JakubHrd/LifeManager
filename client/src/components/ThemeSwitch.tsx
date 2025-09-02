import * as React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/DarkMode';
import Brightness7Icon from '@mui/icons-material/LightMode';

export default function ThemeSwitch() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const [dark, setDark] = React.useState(isDark);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : '');
  }, [dark]);

  return (
    <Tooltip title={dark ? 'Přepnout na světlý' : 'Přepnout na tmavý'}>
      <IconButton onClick={() => setDark(v => !v)} color="inherit" size="small">
        {dark ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Tooltip>
  );
}
