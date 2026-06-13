import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./client-promise";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        if (!email || typeof email !== "string") return null;
        const { connectDB } = await import("@/lib/db/mongodb");
        const { User: UserModel } = await import("@/lib/db/models");
        await connectDB();
        const user = await UserModel.findOne({ email });
        if (!user) return null;
        return { id: user._id.toString(), email: user.email, name: user.name };
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "user";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token) {
        session.user.id = (token as any).id ?? (token as any).sub;
        (session.user as any).role = (token as any).role || "user";
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
});
