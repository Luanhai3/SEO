import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      // Chỉ cho phép email có đuôi @gmail.com
      if (user.email?.endsWith("@gmail.com")) {
        return true;
      }
      return false; // Từ chối các email khác
    },
  },
});

export { handler as GET, handler as POST };