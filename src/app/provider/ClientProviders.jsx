"use client";

import { AuthProvider } from "../../context/AuthContext";
import { Provider } from "react-redux";
import { store } from "../store";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function ClientProviders({ children }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Provider store={store}>
          {children}
        </Provider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
