import { AuthProvider } from "./context/AuthContext";
import ColorSchemeProvider from "./components/ColorSchemeProvider";
import AppRoutes from "./routes";

function App() {
  return (
    <AuthProvider>
      <ColorSchemeProvider>
        <AppRoutes />
      </ColorSchemeProvider>
    </AuthProvider>
  );
}

export default App;
