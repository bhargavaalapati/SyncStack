import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        GitHub({
            clientId: process.env.AUTH_GITHUB_ID,
            clientSecret: process.env.AUTH_GITHUB_SECRET,
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "github") {
                await connectDB();
                try {
                    // Check if user already exists in our database
                    const existingUser = await User.findOne({ email: user.email });

                    if (!existingUser) {
                        // Auto-onboard the user using their GitHub data
                        await User.create({
                            name: user.name || profile?.login,
                            email: user.email,
                            image: user.image,
                            github_url: profile?.html_url || `https://github.com/${profile?.login}`,
                            // tech_skills and branch will be empty defaults, to be filled later
                        });
                        console.log("🚀 New SyncStack Developer Onboarded!");
                    }
                    return true; // Allow sign in
                } catch (error) {
                    console.error("Error saving user to MongoDB during sign-in:", error);
                    return false; // Deny sign in if DB fails
                }
            }
            return true;
        },
        async session({ session }) {
            // Attach the MongoDB _id to the session so we can use it in Server Actions later
            if (session.user?.email) {
                await connectDB();
                const dbUser = await User.findOne({ email: session.user.email });
                if (dbUser) {
                    session.user.id = dbUser._id.toString();
                }
            }
            return session;
        },
    },
});