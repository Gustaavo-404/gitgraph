import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.name ?? undefined;
        token.image = user.image ?? undefined;
      }

      if (account?.access_token) {
        token.accessToken = account.access_token;
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.username = token.username;
      session.user.image = token.image;
      session.user.accessToken = token.accessToken as string;

      return session;
    }
  }
  ,
};
