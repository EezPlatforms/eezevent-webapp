import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  clearStoredAuth,
  getStoredAuth,
  loginClient,
  loginWithGoogle,
  loginVendor,
  logoutClient,
  logoutVendor,
  resendBusinessEmailCode,
  resendClientEmailCode,
  setStoredAuth,
  validateBusinessEmail,
  validateClientEmail,
} from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null);

  useEffect(() => { setAuth(getStoredAuth()); }, []);

  const value = useMemo(
    () => ({
      auth,
      isAuthenticated: Boolean(auth?.token),
      async login({ loginType, email, password }) {
        const data =
          loginType === "vendor"
            ? await loginVendor(email, password)
            : await loginClient(email, password);

        const nextAuth = {
          token: data?.token || "",
          userType: data?.userType || loginType,
          userEmail: data?.userEmail || email,
          userFirstName: data?.userFirstName || "",
          userLastName: data?.userLastName || "",
          userPhone: data?.userPhone || "",
          isEventPlanner: Boolean(data?.is_event_planner),
        };

        setAuth(nextAuth);
        setStoredAuth(nextAuth);
        return data;
      },
      async loginWithGoogle({ loginType, idToken }) {
        const data = await loginWithGoogle({
          idToken,
          userType: loginType,
          clientPlatform: "web",
        });

        const nextAuth = {
          token: data?.token || "",
          userType: data?.userType || loginType,
          userEmail: data?.userEmail || "",
          userFirstName: data?.userFirstName || "",
          userLastName: data?.userLastName || "",
          userPhone: data?.userPhone || "",
          isEventPlanner: Boolean(data?.is_event_planner),
        };

        setAuth(nextAuth);
        setStoredAuth(nextAuth);
        return data;
      },
      async logout() {
        try {
          if (auth?.userType === "vendor") {
            await logoutVendor();
          } else if (auth?.userType === "client") {
            await logoutClient();
          }
        } catch {
          // Clearing local auth is still the important part for the webapp.
        } finally {
          setAuth(null);
          clearStoredAuth();
        }
      },
      async validateEmail({ loginType, email, code }) {
        return loginType === "vendor"
          ? validateBusinessEmail(email, code)
          : validateClientEmail(email, code);
      },
      async resendValidationCode({ loginType, email }) {
        return loginType === "vendor"
          ? resendBusinessEmailCode(email)
          : resendClientEmailCode(email);
      },
    }),
    [auth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
