import type { NextAuthConfig } from "next-auth";

const authConfig = {
  pages: {
    signIn: "/",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = auth?.user?.role;
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

      if (nextUrl.pathname.startsWith("/admin") && userRole !== "admin") {
        return Response.redirect(new URL("/plates", nextUrl));
      }

      if (isLoggedIn && nextUrl.pathname === "/") {
        return Response.redirect(new URL("/plates", nextUrl));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;

export default authConfig;
