import type { NextAuthConfig } from "next-auth";

/**
 * Auth.js config used in middleware (Edge Runtime).
 * Must NOT import any Node.js-only modules (pg, bcrypt, prisma, etc.).
 */
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    jwt({ token, user, account }) {
      if (user && account) {
        // Role is stored on the extended user object returned from authorize()
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "member";
      }
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      if (token.role) (session.user as { role?: string }).role = token.role as string;
      return session;
    },
  },
};
