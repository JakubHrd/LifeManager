// src/App.tsx
import { AuthProvider } from "./context/AuthContext";
import ColorSchemeProvider from "./components/ColorSchemeProvider";
import GlobalLoadingProvider from "./components/GlobalLoadingProvider";
import AppRoutes from "./routes";
import { SnackbarProvider } from "notistack";
import RootErrorBoundary from "./components/RootErrorBoundary";

// ➕ React Query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// Volitelné (můžeš klidně smazat pokud nechceš Devtools)
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

function App() {
  return (
    <AuthProvider>
      <ColorSchemeProvider>
        <GlobalLoadingProvider>
          <RootErrorBoundary>
            <SnackbarProvider
              maxSnack={3}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
              {/* ⬇️ Jediná novinka – obalíme AppRoutes do React Query providera */}
              <QueryClientProvider client={queryClient}>
                <AppRoutes />
                {/* <ReactQueryDevtools initialIsOpen={false} /> */}
              </QueryClientProvider>
            </SnackbarProvider>
          </RootErrorBoundary>
        </GlobalLoadingProvider>
      </ColorSchemeProvider>
    </AuthProvider>
  );
}

export default App;
