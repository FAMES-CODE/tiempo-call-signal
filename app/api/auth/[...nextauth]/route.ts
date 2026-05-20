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
        role: user.role,
        mustChangePassword: user.mustChangePassword,
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
          role: authResult.user.role,
          mustChangePassword: authResult.user.mustChangePassword,
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
    async jwt({
      token,
      user,
      trigger,
      session,
    }: {
      token: JWT;
      user?: import("next-auth").User | undefined;
      trigger?: "signIn" | "signUp" | "update";
      session?: { mustChangePassword?: boolean } | null;
    }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "user";

        const dbUser = await prisma.user.findUnique({
          where: { id: Number(user.id) },
          omit: { password: true },
        });

        if (dbUser) {
          token.username = dbUser.username;
          token.role = dbUser.role;
          token.mustChangePassword = dbUser.mustChangePassword;
        } else {
          token.mustChangePassword = Boolean(user.mustChangePassword);
        }
      }
      if (trigger === "update" && session?.mustChangePassword === false) {
        token.mustChangePassword = false;
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
          mustChangePassword: Boolean(token.mustChangePassword),
        },
      };
    },
  },
} as const satisfies AuthOptions;

// App Router requires explicit exports
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
