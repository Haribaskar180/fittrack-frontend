import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider, PaletteMode } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import App from './App';
import { store } from './store';
import { getTheme } from './theme';

export const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 5 * 60 * 1000 },
  },
});

function Root() {
  const [mode, setMode] = useState<PaletteMode>('light');
  const colorMode = useMemo(
    () => ({ toggleColorMode: () => setMode((m) => (m === 'light' ? 'dark' : 'light')) }),
    []
  );
  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </SnackbarProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Root />
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);
