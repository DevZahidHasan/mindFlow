import * as React from "react";
import Link from "next/link";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata = {
  title: "Sign In — MINDSPACE",
  description: "Enter your knowledge space.",
};

export default function LoginPage() {
  return (
    <>
      <header className="flex flex-col gap-6 text-center select-none items-center mb-8">
        <Link
          href="/"
          className="font-display font-medium text-xs tracking-[0.2em] text-muted hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-accent uppercase"
        >
          MINDSPACE
        </Link>
        <h1 className="text-4xl md:text-5xl font-display font-light tracking-tight leading-[1.1]">
          ENTER YOUR
          <br />
          <span className="font-medium">KNOWLEDGE SPACE</span>
        </h1>
      </header>

      <LoginForm />

      <footer className="text-center text-xs font-sans text-muted mt-8">
        <Link
          href="/signup"
          className="hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-accent uppercase tracking-widest"
        >
          Create an account
        </Link>
      </footer>
    </>
  );
}
