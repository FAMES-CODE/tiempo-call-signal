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
        }
        return {
          id: String(authResult.user.id),
          username: authResult.user.username,
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

        // Fetch full user data from DB
        const dbUser = await prisma.user.findUnique({
          where: { id: Number(user.id) },
          omit: { password: true },
        });

        if (dbUser) {
          token.username = dbUser.username;
          token.role = dbUser.role;
          // add any other fields you need
        }
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      return {
        ...session,
        user: {
          id: token.id as string,
          username: token.username as string,
          role: token.role as string,
        },
      };
    },
  },
} as const satisfies AuthOptions;

// App Router requires explicit exports
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
