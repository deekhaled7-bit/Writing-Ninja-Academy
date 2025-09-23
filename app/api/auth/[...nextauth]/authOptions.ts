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
      profilePicture?: string | null; // Add profilePicture field
      ninjaLevel?: number; // Add ninjaLevel field
      isSubscribed: boolean;
      subscriptionExpiryDate?: Date | null;
      // loyaltyPoints?: number;
      sessionId?: string; // Add sessionId here
      role?: string; // Add role for user type (admin, teacher, student)
      active?: boolean; // Add active status for account access control
      verified?: boolean; // Add verified status for account access control
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isSubscribed?: boolean;
    // loyaltyPoints?: number;
    sessionId?: string; // Add sessionId here
    role?: string; // Add role for user type (admin, teacher, student)
    active?: boolean; // Add active status for account access control
    verified?: boolean; // Add verified status for account access control
    profilePicture?: string | null; // Add profilePicture field
    ninjaLevel?: number; // Add ninjaLevel field
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
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role || "student",
            active: user.active ? user.active : false, // Include actual active status from database
            verified: user.verified ? user.verified : false, // Include actual verified status from database
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
            active: true, // Set active to true for testing
            verified: true, // Set verified to true for testing
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

        // Log the token and user for debugging
        // console.log("JWT callback - token:", {
        //   ...token,
        //   sub: token.sub ? "[REDACTED]" : undefined,
        // });
        // console.log(
        //   "JWT callback - user:",
        //   user ? { ...user, id: "[REDACTED]" } : "No user data"
        // );

        // If user object is present (during sign-in), explicitly set active and verified
        if (user) {
          token.active = (user as any).active;
          token.verified = (user as any).verified;
          // console.log("JWT callback - setting active:", token.active);
          // console.log("JWT callback - setting verified:", token.verified);
        }

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

          // If this is a new sign in, get the user's role from the database
          if (user) {
            console.log(
              "Setting role from user object:",
              (user as any).role || "student"
            );
            token.role = (user as any).role || "student";
          }

          // Always fetch the latest user data from the database
          if (token.email) {
            const dbUser = await UserModel.findOne({ email: token.email });
            if (dbUser) {
              console.log(
                "Setting role from database:",
                dbUser.role || "student"
              );
              console.log("Database user active status:", dbUser.active);
              console.log("Database user verified status:", dbUser.verified);

              token.role = dbUser.role || "student";
              token.active = dbUser.active; // Use the actual value from the database
              token.verified = dbUser.verified; // Use the actual value from the database
              token.profilePicture = dbUser.profilePicture; // Add profilePicture to token
              token.ninjaLevel = dbUser.ninjaLevel; // Add ninjaLevel to token
            }
          }
        }

        // Attach sessionId to token
        if ((user as any)?.sessionId) {
          token.sessionId = (user as any).sessionId;
          console.log("Setting sessionId from user:", (user as any).sessionId);
        }

        // Create a new session if one doesn't exist
        if (token.sub && !token.sessionId) {
          const sessionId = uuidv4();
          await SessionModel.findOneAndUpdate(
            { userId: token.sub },
            { sessionId, createdAt: new Date() },
            { upsert: true }
          );
          token.sessionId = sessionId;
          console.log("Created new session:", { userId: token.sub, sessionId });
        }

        // Don't validate session for now to prevent redirect loops
        // Just ensure the session exists in the database
        if (token.sub && token.sessionId) {
          const dbSession = await SessionModel.findOne({ userId: token.sub });
          if (!dbSession) {
            // Create a new session if one doesn't exist
            await SessionModel.create({
              userId: token.sub,
              sessionId: token.sessionId,
              createdAt: new Date(),
            });
            console.log("Created missing session:", {
              userId: token.sub,
              sessionId: token.sessionId,
            });
          }
        }
      } catch (error) {
        console.error("JWT callback error:", error);
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
        session.user.role = (token.role as string) || "student";
        session.user.active = token.active; // Use the actual value from the token
        session.user.verified = token.verified; // Use the actual value from the token
        session.user.profilePicture = token.profilePicture as string || null; // Add profilePicture to session
        session.user.ninjaLevel = token.ninjaLevel as number || 1; // Add ninjaLevel to session with default value 1

        // Log session values for debugging
        // console.log("Session callback - token active:", token.active);
        // console.log("Session callback - token verified:", token.verified);
        // console.log("Session callback - session user active:", session.user.active);
        // console.log("Session callback - session user verified:", session.user.verified);
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
