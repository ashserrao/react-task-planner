import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { Field } from "./field";
import { SocialButtons } from "./social-buttons";
import { Button } from "../ui/button";
import Divider from "./divider";
import { useAuth } from "./AuthContext";
import { User, AtSign, Phone, Lock, Loader2, ShieldCheck } from "lucide-react";

export function SignupForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const mismatch = confirm.length > 0 && password !== confirm;
  const { signup } = useAuth();
  const navigate = useNavigate();

  function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (mismatch) return;

    const formData = new FormData(e.currentTarget);
    const payload = {
      firstName: formData.get("firstName")?.toString() ?? "",
      lastName: formData.get("lastName")?.toString() ?? "",
      email: formData.get("email")?.toString() ?? "",
      phone: formData.get("phone")?.toString() ?? "",
      password,
    };

    setLoading(true);
    setTimeout(() => {
      const result = signup(payload);
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
          Get started
        </span>
        <h1 className="mt-4 text-balance font-display text-3xl font-bold tracking-tight text-foreground">
          Create your account
        </h1>
        <p className="mt-2 leading-relaxed text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-accent underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="animate-fade-up mt-8" style={{ animationDelay: "0.08s" }}>
        <SocialButtons action="Sign up" />
      </div>

      <div className="animate-fade-up" style={{ animationDelay: "0.14s" }}>
        <Divider>or sign up with email</Divider>
      </div>

      <form
        onSubmit={onSubmit}
        className="animate-fade-up flex flex-col gap-4"
        style={{ animationDelay: "0.2s" }}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="First name"
            name="firstName"
            placeholder="Jane"
            autoComplete="given-name"
            icon={<User className="size-4" />}
            required
          />
          <Field
            label="Last name"
            name="lastName"
            placeholder="Doe"
            autoComplete="family-name"
            required
          />
        </div>
        <Field
          label="Email"
          name="email"
          type="email"
          placeholder="jane@company.com"
          autoComplete="email"
          icon={<AtSign className="size-4" />}
          required
        />
        <Field
          label="Phone"
          name="phone"
          type="tel"
          placeholder="+1 (555) 000-0000"
          autoComplete="tel"
          icon={<Phone className="size-4" />}
          required
        />
        <Field
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          icon={<Lock className="size-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="flex flex-col gap-1">
          <Field
            label="Confirm password"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            icon={<ShieldCheck className="size-4" />}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            aria-invalid={mismatch}
            required
          />
          {mismatch && (
            <span className="text-xs text-destructive">
              Passwords don&apos;t match.
            </span>
          )}
        </div>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <Button
          type="submit"
          disabled={loading || mismatch}
          className="mt-2 h-11 w-full bg-primary text-primary-foreground shadow-[0_10px_30px_-12px_rgba(122,41,56,0.9)] transition-transform hover:-translate-y-0.5 hover:bg-primary/90"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Creating account…
            </>
          ) : (
            "Create account"
          )}
        </Button>
        <p className="text-center text-xs leading-relaxed text-muted-foreground/70">
          By creating an account you agree to our{" "}
          <Link
            to="#"
            className="text-accent underline-offset-4 hover:underline"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            to="#"
            className="text-accent underline-offset-4 hover:underline"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </div>
  );
}
