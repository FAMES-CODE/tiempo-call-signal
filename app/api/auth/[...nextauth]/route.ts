import NextAuth, { type AuthOptions, type Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { type JWT } from "next-auth/jwt";
import prisma from "@/app/db";
import bcrypt from "bcrypt";

// Authenticate user with database
async function authenticateUser({
  username,
  password,
}: {
  username: string;
  password: string;
}) {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return {
      user: {
        id: user.id,
        username: user.username,
      },
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "username", type: "username" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const authResult = await authenticateUser({
          username: credentials.username,
          password: credentials.password,
        });

        if (!authResult) {
          console.log("Authentication failed");
          return null;
        };
        console.log(authResult);
        return {
          id: String(authResult.user.id),
          name: authResult.user.username,
          role: "user",
        };
      },
    }),
  ],

  pages: {
    signIn: "/",
    error: "/login",
  },

  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
} as const satisfies AuthOptions;

// App Router requires explicit exports
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
