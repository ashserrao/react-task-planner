import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);

const SESSION_KEY = "taskplanner.auth.session";
const USERS_KEY = "taskplanner.auth.users";

export const DEMO_CREDENTIALS = {
  identifier: "demo@ashtro.dev",
  password: "Demo@123",
};

const DEMO_USER = {
  username: "demo",
  email: "demo@ashtro.dev",
  password: "Demo@123",
  firstName: "Demo",
  lastName: "User",
};

function readStoredUsers() {
  try {
    const stored = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    return [DEMO_USER, ...stored];
  } catch {
    return [DEMO_USER];
  }
}

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSession);

  useEffect(() => {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [user]);

  const login = useCallback((identifier, password) => {
    const cleanIdentifier = identifier?.trim().toLowerCase();
    const match = readStoredUsers().find(
      (candidate) =>
        (candidate.username?.toLowerCase() === cleanIdentifier ||
          candidate.email?.toLowerCase() === cleanIdentifier) &&
        candidate.password === password,
    );

    if (!match) {
      return { success: false, error: "Invalid username/email or password." };
    }

    const { password: _password, ...safeUser } = match;
    setUser(safeUser);
    return { success: true };
  }, []);

  const signup = useCallback((data) => {
    const email = data.email?.trim().toLowerCase();
    const existingUsers = readStoredUsers();
    const alreadyExists = existingUsers.some(
      (candidate) => candidate.email?.toLowerCase() === email,
    );

    if (alreadyExists) {
      return {
        success: false,
        error: "An account with that email already exists.",
      };
    }

    const newUser = { ...data, username: email, email };
    const storedOnly = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    storedOnly.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(storedOnly));

    const { password: _password, ...safeUser } = newUser;
    setUser(safeUser);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      signup,
      logout,
    }),
    [user, login, signup, logout],
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
