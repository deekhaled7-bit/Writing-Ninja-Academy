import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { ConnectDB } from "@/config/db";
import { compare } from "bcryptjs";
import UserModel from "@/models/userModel";
import subscriptionsModel from "@/models/subscriptionsModel";
import { v4 as uuidv4 } from "uuid";
import SessionModel from "@/models/sessionsModel";
import { Types } from "mongoose"; // For ObjectId

// Extend NextAuth types to include isSubscribed
let loyaltyPoints = 0;

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      firstName?: string;
      lastName?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isSubscribed: boolean;
      subscriptionExpiryDate?: Date | null;
      // loyaltyPoints?: number;
      sessionId?: string; // Add sessionId here
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isSubscribed?: boolean;
    // loyaltyPoints?: number;
    sessionId?: string; // Add sessionId here
  }
}

// Helper function to calculate loyalty points
// async function calculateLoyaltyPoints(email: string) {
//   let loyaltyPoints = 0;
//   const transactions = await LoyaltyTransactionModel.find({ email }).populate(
//     "bonusID"
//   ); // Populate bonusID for non-purchase transactions

//   for (const tx of transactions) {
//     if (tx.reason === "purchase") {
//       loyaltyPoints += tx.amount;
//     } else if (tx.bonusID && tx.bonusID.amount) {
//       loyaltyPoints += tx.bonusID.bonusPoints;
//     }
//   }
//   return loyaltyPoints;
// }

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.googleClientId!,
      clientSecret: process.env.googleClientSecret!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        try {
          await ConnectDB();
          const user = await UserModel.findOne({ email: credentials?.email });
          if (!user) throw new Error("No user found");

          const isValid = await compare(credentials!.password, user.password);
          if (!isValid) throw new Error("Wrong password");

          if (!credentials?.email) {
            throw new Error("Email is required for loyalty points calculation");
          }
          // const loyaltyPoints = await calculateLoyaltyPoints(credentials.email);

          // Generate and store sessionId for single-session enforcement
          const sessionId = uuidv4();
          await SessionModel.findOneAndUpdate(
            { userId: user._id.toString() },
            { sessionId, createdAt: new Date() },
            { upsert: true }
          );

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.username,
            // loyaltyPoints,
            sessionId, // Attach sessionId for JWT
          };
        } catch (error) {
          console.error("Authorize error:", error);
          throw new Error("Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      await ConnectDB();
      let userId: string | undefined;

      if (account?.provider === "google") {
        let existingUser = await UserModel.findOne({ email: user.email });
        if (!existingUser) {
          const subscribed = await subscriptionsModel.findOne({
            email: user.email,
            subscribed: true,
          });
          existingUser = await UserModel.create({
            username: user.name || user.email?.split("@")[0] || "user",
            email: user.email,
            emailVerified: true,
            imageURL: user.image,
            subscription: subscribed ? (subscribed._id as string) : undefined,
          });
        }
        userId = (existingUser as any)._id?.toString();
        user.id = userId ?? ""; // Always set user.id for NextAuth
      } else {
        // Credentials provider
        userId = user.id || (user as any)._id?.toString();
        user.id = userId ?? ""; // Always set user.id for NextAuth
      }

      // Generate and store sessionId for single-session enforcement
      if (user?.email && userId) {
        const sessionId = uuidv4();
        await SessionModel.findOneAndUpdate(
          { userId },
          { sessionId, createdAt: new Date() },
          { upsert: true }
        );
        (user as any).sessionId = sessionId; // Attach to user for JWT
      }
      return true;
    },

    async jwt({ token, user }) {
      try {
        await ConnectDB();
        const email = user?.email || token.email;
        if (email) {
          const subscription = await subscriptionsModel.findOne({
            email,
            subscribed: true,
          });
          token.isSubscribed = !!(
            subscription?.expiryDate &&
            subscription.expiryDate.getTime() > Date.now()
          );
          token.subscriptionExpiryDate = subscription?.expiryDate
            ? subscription.expiryDate.toISOString()
            : null;
          // token.loyaltyPoints = await calculateLoyaltyPoints(email);
        }
      } catch (error) {
        console.error("JWT callback error:", error);
      }
      // Attach sessionId to token
      if ((user as any)?.sessionId) {
        token.sessionId = (user as any).sessionId;
      }
      // Check session validity
      if (token.sub && token.sessionId) {
        const dbSession = await SessionModel.findOne({ userId: token.sub });
        if (!dbSession || dbSession.sessionId !== token.sessionId) {
          throw new Error("Session invalidated: logged in elsewhere.");
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (session.user) {
        session.user.isSubscribed = token.isSubscribed ?? false;
        session.user.subscriptionExpiryDate = token.subscriptionExpiryDate
          ? new Date(token.subscriptionExpiryDate as string)
          : null;
        // session.user.loyaltyPoints = token.loyaltyPoints;
      }
      if (session.user && token.sessionId) {
        session.user.sessionId = token.sessionId;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt" as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
