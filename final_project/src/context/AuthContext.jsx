import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "../firebase/config";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return undefined;
    }

    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
  }, []);

  const login = async (email, password) => {
    setAuthError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch {
      setAuthError("登入失敗，請確認 Email 與密碼");
      return false;
    }
  };

  const register = async (email, password) => {
    setAuthError("");

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const displayName = email.split("@")[0];

      await updateProfile(credential.user, { displayName });

      if (db) {
        await setDoc(doc(db, "users", credential.user.uid), {
          displayName,
          monthlyBudget: 8000,
          email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      return true;
    } catch {
      setAuthError("註冊失敗，密碼至少 6 碼，Email 不能重複");
      return false;
    }
  };

  const logout = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  const value = useMemo(
    () => ({
      authError,
      isFirebaseConfigured,
      loading,
      login,
      logout,
      register,
      user,
    }),
    [authError, loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
