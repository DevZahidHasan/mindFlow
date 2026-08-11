import * as React from "react";
import Link from "next/link";
import { SignupForm } from "@/features/auth/components/signup-form";

export const metadata = {
  title: "Create Space — MINDSPACE",
  description: "Create the beginning of your universe.",
};

export default function SignupPage() {
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
          CREATE
          <br />
          <span className="font-medium">YOUR SPACE</span>
        </h1>
      </header>

      <SignupForm />

      <footer className="text-center text-xs font-sans text-muted mt-8">
        <Link
          href="/login"
          className="hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-accent uppercase tracking-widest"
        >
          I already have a space
        </Link>
      </footer>
    </>
  );
}
