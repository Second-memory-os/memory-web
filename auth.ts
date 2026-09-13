import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const googleConfigured = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
);

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    ...(googleConfigured
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email.toLowerCase()))
          .limit(1);

        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== 'google') return true;

      const email = user.email?.toLowerCase();
      if (!email) return false;

      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existing) {
        user.id = existing.id;
        if (user.name && !existing.name) {
          await db
            .update(users)
            .set({ name: user.name, emailVerified: true, updatedAt: new Date() })
            .where(eq(users.id, existing.id));
        } else if (!existing.emailVerified) {
          await db
            .update(users)
            .set({ emailVerified: true, updatedAt: new Date() })
            .where(eq(users.id, existing.id));
        }
        return true;
      }

      const [created] = await db
        .insert(users)
        .values({
          email,
          name: user.name || email.split('@')[0],
          passwordHash: null,
          emailVerified: true,
        })
        .returning({ id: users.id });

      if (!created?.id) return false;

      user.id = created.id;
      try {
        const { ensureManagedMemoryConnection } = await import('@/lib/memory-provisioning');
        await ensureManagedMemoryConnection(created.id);
      } catch (err) {
        console.error('Failed to provision memory for Google user:', err);
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      } else if (!token.id && token.email) {
        const [row] = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.email, String(token.email).toLowerCase()))
          .limit(1);
        if (row) token.id = row.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? token.sub ?? '';
      }
      return session;
    },
  },
});
