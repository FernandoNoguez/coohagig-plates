import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { findUserByUsername } from "@/lib/users";
import { verifyPassword } from "@/lib/password";

export const { handlers, signIn, signOut, auth } = NextAuth({
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

        const passwordValid = verifyPassword(password, user.passwordHash, user.passwordSalt);
        if (!passwordValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          name: user.user,
          email: user.email,
        };
      },
    }),
  ],
  pages: {
    signIn: "/",
  },
  callbacks: {

    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPublicPage =
        nextUrl.pathname === "/" ||
        nextUrl.pathname.startsWith("/cadastro") ||
        nextUrl.pathname.startsWith("/api/auth") ||
        nextUrl.pathname.startsWith("/api/register") ||
        nextUrl.pathname.startsWith("/_next") ||
        nextUrl.pathname === "/favicon.ico";

      if (!isLoggedIn && !isPublicPage) {
        return false;
      }

      if (isLoggedIn && nextUrl.pathname === "/") {
        return Response.redirect(new URL("/plates", nextUrl));
      }

      return true;
    },
  },
});
