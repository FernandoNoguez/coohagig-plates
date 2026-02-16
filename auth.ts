import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import authConfig from "@/auth.config";
import { findUserByUsername } from "@/lib/users";
import { verifyPassword } from "@/lib/password";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        user: { label: "Usuário", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const username = String(credentials?.user ?? "").trim();
        const password = String(credentials?.password ?? "");

        if (!username || !password) {
          return null;
        }

        const user = await findUserByUsername(username);
        if (!user) {
          return null;
        }

        if (!user.isActive) {
          return null;
        }

        const passwordValid = verifyPassword(password, user.passwordHash, user.passwordSalt);
        if (!passwordValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          name: user.user,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user) {
        token.role = ((user as { role?: string }).role ?? "user") as "user" | "admin";
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = String(token.role ?? "user") as "user" | "admin";
      }

      return session;
    },
  },
});
