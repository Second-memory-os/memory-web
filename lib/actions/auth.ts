'use server';

import { createHash, randomBytes } from 'crypto';
import { eq, and, isNull, gt } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/lib/db';
import { passwordResetTokens, users } from '@/lib/db/schema';
import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';
import { SITE } from '@/lib/site';

const signupSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  password: z.string().min(6).max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type AuthActionState = {
  error?: string;
  success?: string;
};

export async function googleSignInAction(callbackUrl = '/dashboard') {
  const redirectTo =
    callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')
      ? callbackUrl
      : '/dashboard';

  if (!process.env.AUTH_GOOGLE_ID || !process.env.AUTH_GOOGLE_SECRET) {
    throw new Error('Google OAuth is not configured');
  }

  await signIn('google', { redirectTo });
}

export async function signupAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { error: 'Enter a valid name, email, and password (min 6 chars).' };
  }

  const email = parsed.data.email.toLowerCase();
  const [existing] = await db
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing?.passwordHash) {
    return { error: 'An account with this email already exists.' };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  if (existing) {
    // Google-only account getting a password
    await db
      .update(users)
      .set({
        name: parsed.data.name,
        passwordHash,
        emailVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, existing.id));
  } else {
    const [created] = await db
      .insert(users)
      .values({
        name: parsed.data.name,
        email,
        passwordHash,
        emailVerified: true,
      })
      .returning({ id: users.id });

    if (created?.id) {
      const { ensureManagedMemoryConnection } = await import('@/lib/memory-provisioning');
      await ensureManagedMemoryConnection(created.id);
    }
  }

  try {
    await signIn('credentials', {
      email,
      password: parsed.data.password,
      redirectTo: '/dashboard',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Account created, but sign-in failed. Try logging in.' };
    }
    throw error;
  }

  return { success: 'Account created.' };
}

export async function loginAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { error: 'Enter a valid email and password.' };
  }

  try {
    const callbackUrl = String(formData.get('callbackUrl') || '/dashboard');
    const redirectTo =
      callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')
        ? callbackUrl
        : '/dashboard';

    await signIn('credentials', {
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Invalid email or password.' };
    }
    throw error;
  }

  return { success: 'Signed in.' };
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export async function forgotPasswordAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const emailRaw = String(formData.get('email') || '');
  const parsed = z.string().email().safeParse(emailRaw);
  if (!parsed.success) {
    return { error: 'Enter a valid email address.' };
  }

  const email = parsed.data.toLowerCase();
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  // Always succeed outwardly (do not leak whether the email exists)
  const genericSuccess =
    'If an account exists for that email, you will receive reset instructions shortly.';

  if (!user?.passwordHash) {
    return { success: genericSuccess };
  }

  const token = randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await db.insert(passwordResetTokens).values({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  const base = process.env.NEXTAUTH_URL || process.env.AUTH_URL || 'http://localhost:3000';
  const resetUrl = `${base.replace(/\/$/, '')}/reset-password?token=${token}`;

  try {
    await sendResetEmail(email, resetUrl);
  } catch (err) {
    console.error('Password reset email failed:', err);
    console.info(`[dev] Password reset link for ${email}: ${resetUrl}`);
  }

  return { success: genericSuccess };
}

async function sendResetEmail(to: string, resetUrl: string) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    console.info(`[dev] Password reset link for ${to}: ${resetUrl}`);
    return;
  }

  const nodemailer = await import('nodemailer');
  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || SITE.supportEmail,
    to,
    subject: `Reset your ${SITE.name} password`,
    text: `Reset your password:\n\n${resetUrl}\n\nThis link expires in 1 hour. If you did not request this, ignore this email.`,
    html: `<p>Reset your ${SITE.name} password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 1 hour.</p>`,
  });
}

export async function resetPasswordAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const token = String(formData.get('token') || '');
  const password = String(formData.get('password') || '');
  const confirm = String(formData.get('confirm') || '');

  if (!token || token.length < 20) {
    return { error: 'Invalid or missing reset token.' };
  }
  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters.' };
  }
  if (password !== confirm) {
    return { error: 'Passwords do not match.' };
  }

  const tokenHash = hashToken(token);
  const [row] = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, tokenHash),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!row) {
    return { error: 'This reset link is invalid or has expired.' };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, row.userId));
  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokens.id, row.id));

  return { success: 'Password updated. You can sign in now.' };
}

export async function signOutAction() {
  await signOut({ redirectTo: '/login' });
}

