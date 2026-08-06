import { useState } from "react";
import { LockKeyhole, LogIn } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { AnimatedBorder } from "../components/AnimatedBorder";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
    } catch (caughtError) {
      console.error(caughtError);
      setError("Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#02040c] px-4 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-48 top-0 size-[600px] rounded-full bg-blue-600/20 blur-[150px]" />
        <div className="absolute -right-48 bottom-0 size-[600px] rounded-full bg-pink-600/20 blur-[160px]" />
      </div>

      <AnimatedBorder className="relative w-full max-w-md">
        <section className="p-6 md:p-8">
          <header className="mb-8 text-center">
            <img
              src="/images/wby-logo.png"
              alt="Westridge Baptist Youth"
              className="mx-auto mb-5 h-20 w-auto object-contain"
            />

            <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full border border-cyan-400 bg-cyan-400/10 shadow-[0_0_22px_rgba(0,183,255,0.45)]">
              <LockKeyhole className="size-6 text-cyan-300" />
            </div>

            <h1 className="text-3xl font-black">
              Admin Login
            </h1>

            <p className="mt-2 text-white/55">
              WBY Games score control
            </p>
          </header>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-bold uppercase tracking-wide text-white/60"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                disabled={submitting}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                className="w-full rounded-xl border border-white/15 bg-[#080d1d] px-4 py-3 text-white outline-none transition focus:border-cyan-400 disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-bold uppercase tracking-wide text-white/60"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                disabled={submitting}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                className="w-full rounded-xl border border-white/15 bg-[#080d1d] px-4 py-3 text-white outline-none transition focus:border-pink-400 disabled:opacity-50"
              />
            </div>

            {error && (
              <p className="rounded-xl border border-pink-400/30 bg-pink-500/10 px-4 py-3 text-sm text-pink-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-500 to-pink-500 px-5 py-4 font-black uppercase tracking-wide transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogIn className="size-5" />
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </section>
      </AnimatedBorder>
    </main>
  );
}