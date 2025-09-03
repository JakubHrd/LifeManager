import { AuthProvider } from "./context/AuthContext";
import ColorSchemeProvider from "./components/ColorSchemeProvider";
import GlobalLoadingProvider from "./components/GlobalLoadingProvider";
import AppRoutes from "./routes";
import { SnackbarProvider } from "notistack";
import RootErrorBoundary from "./components/RootErrorBoundary";


function App() {
  return (
    <AuthProvider>
      <ColorSchemeProvider>
        <GlobalLoadingProvider>
          <RootErrorBoundary>
            <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
              <AppRoutes />
            </SnackbarProvider>
          </RootErrorBoundary>
        </GlobalLoadingProvider>
      </ColorSchemeProvider>
    </AuthProvider>
  );
}
export default App;
