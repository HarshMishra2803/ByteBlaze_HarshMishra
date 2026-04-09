import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { getUserByEmail } from './db';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter email and password');
        }

        const user = getUserByEmail(credentials.email);
        if (!user) {
          throw new Error('No account found with this email');
        }

        const isValid = await compare(credentials.password, user.password_hash);
        if (!isValid) {
          throw new Error('Invalid password');
        }

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
