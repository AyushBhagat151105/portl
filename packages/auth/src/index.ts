import { Resend } from "resend";
import { expo } from "@better-auth/expo";
import prisma from "@portl/db";
import { env } from "@portl/env/server";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization, bearer, openAPI } from "better-auth/plugins";

const resend = new Resend(env.RESEND_API_KEY || "placeholder");

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  trustedOrigins: [
    env.CORS_ORIGIN,
    "mybetterfullstackapp://",
    "portl://",
    "portl://**",
    ...(env.NODE_ENV === "development"
      ? ["exp://", "exp://**", "exp://192.168.*.*:*/**", "http://localhost:8081"]
      : []),
  ],

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      if (!env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY is not configured. Logging verification link:", url);
        return;
      }
      try {
        await resend.emails.send({
          from: env.EMAIL_FROM || "Portl Gate <onboarding@resend.dev>",
          to: [user.email],
          subject: "Verify your email address",
          html: `<p>Hello ${user.name},</p><p>Please verify your email by clicking the link below:</p><p><a href="${url}">${url}</a></p>`,
        });
      } catch (err) {
        console.error("Failed to send verification email:", err);
      }
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      if (!env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY is not configured. Logging reset password link:", url);
        return;
      }
      try {
        await resend.emails.send({
          from: env.EMAIL_FROM || "Portl Gate <onboarding@resend.dev>",
          to: [user.email],
          subject: "Reset your password",
          html: `<p>Hello ${user.name},</p><p>You can reset your password using the link below:</p><p><a href="${url}">${url}</a></p>`,
        });
      } catch (err) {
        console.error("Failed to send reset password email:", err);
      }
    },
  },

  user: {
    additionalFields: {
      phoneNumber: {
        type: "string",
        required: false,
      },
      phoneNumberVerified: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
    },
  },

  rateLimit: {
    enabled: true,
    window: 10,
    max: 100,
    customRules: {
      "/api/auth/sign-in/email": { window: 60, max: 5 },
      "/api/auth/sign-up/email": { window: 60, max: 3 },
    },
  },

  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },

  plugins: [
    organization(),
    bearer(),
    expo(),
    openAPI(),
  ],
});
