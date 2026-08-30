import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { Field } from "./field";
import { SocialButtons } from "./social-buttons";
import { Button } from "../ui/button";
import Divider from "./divider";
import { useAuth, DEMO_CREDENTIALS } from "./AuthContext";
import { AtSign, Lock, User, Loader2 } from "lucide-react";

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  function onSubmit(e) {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const identifier = formData.get("identifier")?.toString() ?? "";
    const password = formData.get("password")?.toString() ?? "";

    setLoading(true);
    setTimeout(() => {
      const result = login(identifier, password);
      setLoading(false);
      if (result.success) {
        navigate("/", { replace: true });
      } else {
        setError(result.error);
      }
    }, 800);
  }

  return (
    <div className="w-full max-w-md">
      <div className="animate-fade-up">
        <span className="inline-flex items-center rounded-full border border-glow/30 bg-badge px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-badge-foreground">
          Welcome back
        </span>
        <h1 className="mt-4 text-balance font-display text-3xl font-bold tracking-tight text-foreground">
          Sign in to your account
        </h1>
        <p className="mt-2 leading-relaxed text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-accent underline-offset-4 hover:underline"
          >
            Create one
          </Link>
        </p>
        <p className="mt-3 rounded-lg border border-glow/20 bg-secondary/40 px-3 py-2 text-xs text-muted-foreground/80">
          Demo credentials — {DEMO_CREDENTIALS.identifier} /{" "}
          {DEMO_CREDENTIALS.password}
        </p>
      </div>

      <div className="animate-fade-up mt-8" style={{ animationDelay: "0.08s" }}>
        <SocialButtons action="Sign in" />
      </div>

      <div className="animate-fade-up" style={{ animationDelay: "0.14s" }}>
        <Divider>or continue with</Divider>
      </div>

      <form
        onSubmit={onSubmit}
        className="animate-fade-up flex flex-col gap-4"
        style={{ animationDelay: "0.2s" }}
      >
        <Field
          label="Username or email"
          name="identifier"
          placeholder="jane.doe or jane@company.com"
          autoComplete="username"
          icon={<User className="size-4" />}
          required
        />
        <div className="flex flex-col gap-1.5">
          <Field
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            icon={<Lock className="size-4" />}
            required
          />
          <div className="flex items-center justify-between pt-1">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                className="size-4 rounded border-input bg-secondary/40 accent-accent"
              />
              Remember me
            </label>
            <Link
              to="#"
              className="text-sm text-accent underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="mt-2 h-11 w-full bg-primary text-primary-foreground shadow-[0_10px_30px_-12px_rgba(122,41,56,0.9)] transition-transform hover:-translate-y-0.5 hover:bg-primary/90"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <p
        className="animate-fade-up mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground/70"
        style={{ animationDelay: "0.26s" }}
      >
        <AtSign className="size-3.5" />
        Protected by Ashtro Dev single sign-on
      </p>
    </div>
  );
}

export default LoginForm;
