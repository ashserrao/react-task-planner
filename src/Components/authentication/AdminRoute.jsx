import React from "react";
import { Link, Outlet } from "react-router-dom";
import { Lock } from "lucide-react";
import { useAuth } from "./AuthContext";

// Guards pages that use real Google data. Demo accounts see a notice instead.
function AdminRoute() {
  const { isAdmin } = useAuth();

  if (isAdmin) {
    return <Outlet />;
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-center">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-secondary">
          <Lock className="h-5 w-5 text-muted-foreground" />
        </span>
        <h1 className="mt-4 font-display text-xl font-semibold text-foreground">
          Admin access only
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This page isn&apos;t available with a demo account.
        </p>
        <Link
          to="/"
          className="mt-5 inline-block text-sm font-medium text-accent underline-offset-4 hover:underline"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

export default AdminRoute;
