import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "EXPO_PUBLIC_",
  client: {
    EXPO_PUBLIC_SERVER_URL: z.url(),
    EXPO_PUBLIC_AUTH_REDIRECT_PATH: z.string().default("auth/callback"),
    EXPO_PUBLIC_EAS_PROJECT_ID: z.string().optional(),
    EXPO_PUBLIC_RAZORPAY_KEY_ID: z.string().min(1),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
