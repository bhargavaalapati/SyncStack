import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import GitLab from "next-auth/providers/gitlab";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

interface OAuthProfile {
    html_url?: string;
    login?: string;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        GitHub({
            clientId: process.env.AUTH_GITHUB_ID,
            clientSecret: process.env.AUTH_GITHUB_SECRET,
        }),
        Google({
            clientId: process.env.AUTH_GOOGLE_ID || "",
            clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
        }),
        GitLab({
            clientId: process.env.AUTH_GITLAB_ID || "",
            clientSecret: process.env.AUTH_GITLAB_SECRET || "",
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider) {
                await connectDB();
                try {
                    if (!user.email) return false;

                    const existingUser = await User.findOne({ email: user.email });

                    if (!existingUser) {
                        const oauthProfile = profile as OAuthProfile | undefined;
                        const githubHandle =
                            account.provider === "github"
                                ? oauthProfile?.html_url ||
                                  (oauthProfile?.login
                                      ? `https://github.com/${oauthProfile.login}`
                                      : "")
                                : "";

                        await User.create({
                            name:
                                user.name ||
                                oauthProfile?.login ||
                                user.email.split("@")[0],
                            email: user.email,
                            image:
                                user.image ||
                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email)}`,
                            github_url: githubHandle,
                        });
                        console.log(
                            `🚀 New SyncStack Developer Onboarded via ${account.provider}!`
                        );
                    }
                    return true;
                } catch (error) {
                    console.error("Error saving user to MongoDB during sign-in:", error);
                    return false;
                }
            }
            return true;
        },
        async session({ session }) {
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