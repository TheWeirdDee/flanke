import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const { callbackUrl, error } = await searchParams;
  const redirectTo = callbackUrl ?? "/feed";

  const errorMessages: Record<string, string> = {
    OAuthSignin: "Error starting sign in. Please try again.",
    OAuthCallback: "Error during sign in. Please try again.",
    OAuthAccountNotLinked: "Account already exists with a different provider.",
    Default: "Something went wrong. Please try again.",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#060608] via-[#0b0c10] to-[#040405] text-white px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ color: "#1c6a58" }}>
              <rect x="4" y="4" width="10" height="24" rx="2.5" fill="currentColor" />
              <rect x="18" y="12" width="10" height="16" rx="2.5" fill="currentColor" className="opacity-80" />
              <g transform="translate(17, 1)" style={{ color: "#f8a57d" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="animate-pulse">
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                </svg>
              </g>
            </svg>
            <span className="text-[26px] font-semibold tracking-tight text-white">
              Flanke
            </span>
          </Link>
          <p className="mt-2 text-[13px] text-slate-400">
            Know your enemy&apos;s next move.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-md border border-red-900/40 bg-red-950/20 px-4 py-3">
            <p className="text-[13px] text-red-400">
              {errorMessages[error] ?? errorMessages.Default}
            </p>
          </div>
        )}

        {/* Sign-in card */}
        <div className="rounded-2xl border border-white/10 bg-[#0d0d11]/80 shadow-2xl backdrop-blur-xl p-8">
          <h1 className="mb-1 text-[17px] font-semibold text-white">
            Sign in
          </h1>
          <p className="mb-6 text-[13px] text-slate-400">
            Continue with your GitHub or Google account.
          </p>

          {/* GitHub */}
          <form
            action={async () => {
              "use server";
              try {
                await signIn("github", { redirectTo });
              } catch (err) {
                if (err instanceof AuthError) throw err;
                throw err;
              }
            }}
          >
            <button
              type="submit"
              className="mb-3 flex w-full items-center justify-center gap-3 rounded-md border border-white/10 bg-white/5 px-4 py-2.5 text-[13px] font-medium text-white transition-all hover:bg-white/10 hover:border-white/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <GitHubIcon />
              Continue with GitHub
            </button>
          </form>

          {/* Google */}
          <form
            action={async () => {
              "use server";
              try {
                await signIn("google", { redirectTo });
              } catch (err) {
                if (err instanceof AuthError) throw err;
                throw err;
              }
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-md border border-white/10 bg-white/5 px-4 py-2.5 text-[13px] font-medium text-white transition-all hover:bg-white/10 hover:border-white/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[11px] text-slate-500">
          By signing in you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
}

function GitHubIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z"
        fill="#4285F4"
      />
    </svg>
  );
}
