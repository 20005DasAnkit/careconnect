import AppRoutes from "./routes/AppRoutes";
import AuthProvider from "./context/AuthContext";
import { CartProvider } from "./context/Cartcontext";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppRoutes />
      </CartProvider>
    </AuthProvider>
  );
}