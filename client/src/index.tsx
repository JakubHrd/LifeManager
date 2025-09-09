import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createMuiThemeFromTokens } from './theme/createMuiThemeFromTokens';
import { APP_BASE } from "@/config";

import '../src/styles/tokens.css';
import './index.css';
import App from './App';

const Root = () => {
  const [theme, setTheme] = React.useState(createMuiThemeFromTokens());

  // Když přepneme data-theme na <html>, theme se přegeneruje
  React.useEffect(() => {
    const obs = new MutationObserver(() => setTheme(createMuiThemeFromTokens()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter basename={APP_BASE}>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<Root />);
