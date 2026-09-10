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

// Roles: "admin" uses the real Google Sheet / Calendar APIs and every page.
// "demo" (the demo account and every sign-up) gets sandboxed dummy data.
export const ROLES = { admin: "admin", demo: "demo" };

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

// The admin is not shown on the login page. Only a SHA-256 hash of the
// password is kept here so the plain password isn't in the source.
const ADMIN_USER = {
  username: "ash",
  email: "ash@ashtro.dev",
  passwordHash:
    "c51151c955a1874587796867a097c2b7d7e4ccb155507a25a3fadeafac365ad5",
  firstName: "Ash",
  lastName: "Serrao",
};

async function sha256(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// The role always comes from the account's email, never from stored data.
function withRole(user) {
  if (!user) return null;
  const role =
    user.email?.toLowerCase() === ADMIN_USER.email ? ROLES.admin : ROLES.demo;
  return { ...user, role };
}

function readStoredUsers() {
  try {
    const stored = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    return [ADMIN_USER, DEMO_USER, ...stored];
  } catch {
    return [ADMIN_USER, DEMO_USER];
  }
}

function readSession() {
  try {
    return withRole(JSON.parse(localStorage.getItem(SESSION_KEY) || "null"));
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

  const login = useCallback(async (identifier, password) => {
    const cleanIdentifier = identifier?.trim().toLowerCase();
    const candidates = readStoredUsers().filter(
      (candidate) =>
        candidate.username?.toLowerCase() === cleanIdentifier ||
        candidate.email?.toLowerCase() === cleanIdentifier,
    );

    let match = null;
    for (const candidate of candidates) {
      const ok = candidate.passwordHash
        ? (await sha256(password ?? "")) === candidate.passwordHash
        : candidate.password === password;
      if (ok) {
        match = candidate;
        break;
      }
    }

    if (!match) {
      return { success: false, error: "Invalid username/email or password." };
    }

    const {
      password: _password,
      passwordHash: _passwordHash,
      ...safeUser
    } = match;
    setUser(withRole(safeUser));
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

    const { role: _role, ...fields } = data;
    const newUser = { ...fields, username: email, email };
    const storedOnly = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    storedOnly.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(storedOnly));

    const { password: _password, ...safeUser } = newUser;
    setUser(withRole(safeUser));
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    // TimeTrackingProvider discards the demo sandbox and the task cache.
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === ROLES.admin,
      isDemo: Boolean(user) && user.role !== ROLES.admin,
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
