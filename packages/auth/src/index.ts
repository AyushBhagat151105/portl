import { Resend } from "resend";
import { expo } from "@better-auth/expo";
import prisma from "@portl/db";
import { env } from "@portl/env/server";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization, bearer, openAPI } from "better-auth/plugins";

import { getVerificationEmailTemplate, getResetPasswordEmailTemplate } from "./email-templates";

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
      console.log(`[AUTH EMAIL] Sending verification email to ${user.email}. Link: ${url}`);
      if (!env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY is not configured. Logging verification link:", url);
        return;
      }
      try {
        const html = getVerificationEmailTemplate({ name: user.name, url });
        const { data, error } = await resend.emails.send({
          from: env.EMAIL_FROM || "Portl Gate <noreply@email.ayushbhagat.com>",
          to: [user.email],
          subject: "Verify your Portl account email",
          html,
        });

        if (error) {
          console.error("[RESEND ERROR] Failed to send verification email:", error.message);
          console.warn("[AUTH FALLBACK] Use this verification URL directly:", url);
        } else {
          console.log("[RESEND SUCCESS] Verification email sent successfully. ID:", data?.id);
        }
      } catch (err) {
        console.error("Failed to send verification email:", err);
        console.warn("[AUTH FALLBACK] Use this verification URL directly:", url);
      }
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      console.log(`[AUTH EMAIL] Sending reset password email to ${user.email}. Link: ${url}`);
      if (!env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY is not configured. Logging reset password link:", url);
        return;
      }
      try {
        const html = getResetPasswordEmailTemplate({ name: user.name, url });
        const { data, error } = await resend.emails.send({
          from: env.EMAIL_FROM || "Portl Gate <noreply@email.ayushbhagat.com>",
          to: [user.email],
          subject: "Reset your Portl account password",
          html,
        });

        if (error) {
          console.error("[RESEND ERROR] Failed to send reset password email:", error.message);
          console.warn("[AUTH FALLBACK] Use this reset password URL directly:", url);
        } else {
          console.log("[RESEND SUCCESS] Reset password email sent successfully. ID:", data?.id);
        }
      } catch (err) {
        console.error("Failed to send reset password email:", err);
        console.warn("[AUTH FALLBACK] Use this reset password URL directly:", url);
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
