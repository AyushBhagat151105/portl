import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/lib/auth-client";

export function useVerificationResend(initialEmail?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (cooldownSeconds > 0) {
      interval = setInterval(() => {
        setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cooldownSeconds]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }, []);

  const resend = useCallback(
    async (emailToUse?: string) => {
      const email = emailToUse || initialEmail;
      if (!email || cooldownSeconds > 0) return;

      setIsLoading(true);
      setStatusMessage(null);
      setErrorMessage(null);

      try {
        const { error } = await authClient.sendVerificationEmail({
          email,
          callbackURL: "portl://verify-email",
        });

        if (error) {
          throw new Error(error.message || "Failed to send verification email");
        }

        setStatusMessage(`Verification link sent to ${email}. Please check your inbox.`);
        setCooldownSeconds(120);
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to resend verification email.");
      } finally {
        setIsLoading(false);
      }
    },
    [initialEmail, cooldownSeconds]
  );

  return {
    resend,
    isLoading,
    cooldownSeconds,
    formatTime,
    statusMessage,
    errorMessage,
    setStatusMessage,
    setErrorMessage,
  };
}
