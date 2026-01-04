import { redirect } from "next/navigation";

/**
 * Root page redirects to /home.
 * Middleware handles authentication - if not logged in, /home will redirect to /login.
 */
export default function RootPage() {
  redirect("/home");
}