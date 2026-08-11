import * as React from "react";
import Link from "next/link";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata = {
  title: "Sign In — MINDSPACE",
  description: "Access notes, connections, and your semantic universe.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center px-6 relative">
      {/* Absolute background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="w-full max-w-sm flex flex-col gap-8 z-10">
        <header className="flex flex-col gap-2 text-center select-none">
          <Link
            href="/"
            className="font-display font-medium text-2xl tracking-tight text-foreground hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mb-2 focus-visible:outline-2 focus-visible:outline-accent"
          >
            <span className="w-3 h-3 rounded-full bg-accent" />
            MINDSPACE
          </Link>
          <h1 className="text-xl font-display font-medium tracking-tight uppercase">
            Sign In to your space
          </h1>
          <p className="text-sm text-muted">
            Access notes, connections, and your semantic universe.
          </p>
        </header>

        <LoginForm />

        <footer className="text-center text-xs font-sans text-muted">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="text-accent hover:underline font-medium focus-visible:outline-2 focus-visible:outline-accent"
          >
            Create account
          </Link>
        </footer>
      </div>
    </div>
  );
}
