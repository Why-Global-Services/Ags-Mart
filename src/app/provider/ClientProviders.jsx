"use client";

import { AuthProvider, useAuth } from "../../context/AuthContext";
import { Provider } from "react-redux";
import { store } from "../store";
import AuthPage from "../common/LoginPage";

function GlobalAuthModal() {
  const { isAuthModalOpen, closeLoginModal } = useAuth();
  if (!isAuthModalOpen) return null;
  return <AuthPage onClose={closeLoginModal} />;
}

export default function ClientProviders({ children }) {
  return (
    <AuthProvider>
      <Provider store={store}>
        {children}
        <GlobalAuthModal />
      </Provider>
    </AuthProvider>
  );
}
