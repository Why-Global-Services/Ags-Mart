"use client";

import { AuthProvider } from "../../context/AuthContext";
import { Provider } from "react-redux";
import { store } from "../store";
// Google OAuth is temporarily disabled
// import { GoogleOAuthProvider } from "@react-oauth/google";

export default function ClientProviders({ children }) {
  // const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const content = (
    <AuthProvider>
      <Provider store={store}>
        {children}
      </Provider>
    </AuthProvider>
  );

  // Google OAuth is disabled
  // if (clientId) {
  //   return (
  //     <GoogleOAuthProvider clientId={clientId}>
  //       {content}
  //     </GoogleOAuthProvider>
  //   );
  // }

  return content;
}
