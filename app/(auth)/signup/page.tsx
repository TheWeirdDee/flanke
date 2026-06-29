import { redirect } from "next/navigation";

// Signup uses the same OAuth flow as login — no separate sign-up form needed.
// Redirect directly to login, which creates a workspace on first sign-in.
export default function SignupPage() {
  redirect("/login");
}
