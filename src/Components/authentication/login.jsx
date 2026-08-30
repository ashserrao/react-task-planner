import React from "react";
import AuthShell from "./auth-shell";
import LoginForm from "./login-form";

function LoginPage() {
  return (
    <AuthShell>
      <LoginForm />
    </AuthShell>
  );
}

export default LoginPage;
