"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center">
        <h1 className="text-xl font-bold text-text-primary">Check your email</h1>
        <p className="text-sm text-text-secondary mt-2 mb-6">
          If an account exists with {email}, we&apos;ll send a password reset link.
        </p>
        <Link href="/login">
          <Button variant="outline" className="w-full">Back to sign in</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-text-primary text-center">Reset password</h1>
      <p className="text-sm text-text-secondary text-center mt-1 mb-6">
        Enter your email to receive a reset link
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" className="w-full">Send reset link</Button>
      </form>

      <p className="text-sm text-text-secondary text-center mt-4">
        <Link href="/login" className="text-primary hover:underline">Back to sign in</Link>
      </p>
    </div>
  );
}
