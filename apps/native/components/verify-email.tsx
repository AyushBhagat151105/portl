import { Button, FieldError, Spinner, TextField, Label, Input } from "heroui-native";
import { useState, useEffect } from "react";
import { Text, View, Pressable } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, Link } from "expo-router";
import { authClient } from "@/lib/auth-client";
import { verifyEmailSchema, type VerifyEmailFormData } from "@/lib/form-schemas";
import { Card } from "./ui/card";
import { Ionicons } from "@expo/vector-icons";

interface VerifyEmailProps {
  token?: string;
  email?: string;
}

export function VerifyEmail({ token, email: defaultEmail }: VerifyEmailProps) {
  const { data: session } = authClient.useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isVerifying, setIsVerifying] = useState(!!token);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
  const router = useRouter();

  const activeEmail = defaultEmail || session?.user?.email || "";

  const { control, handleSubmit, setValue } = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
    mode: "onTouched",
    defaultValues: {
      email: activeEmail,
    },
  });

  useEffect(() => {
    if (activeEmail) {
      setValue("email", activeEmail);
    }
  }, [activeEmail]);

  useEffect(() => {
    if (token) {
      handleTokenVerification(token);
    }
  }, [token]);

  // Handle 120-second (2 minute) cooldown timer
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

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }

  async function handleTokenVerification(tokenToVerify: string) {
    setIsVerifying(true);
    setError(null);
    try {
      const { error: verifyErr } = await authClient.verifyEmail({
        query: {
          token: tokenToVerify,
        },
      });

      if (verifyErr) {
        throw new Error(verifyErr.message || "Failed to verify email token");
      }

      setIsVerified(true);
      await authClient.getSession();
    } catch (err: any) {
      setError(err.message || "Verification link is invalid or has expired.");
    } finally {
      setIsVerifying(false);
    }
  }

  async function checkVerificationStatus() {
    setIsCheckingStatus(true);
    setError(null);
    try {
      const { data: currentSession } = await authClient.getSession({
        fetchOptions: {
          headers: {
            "Cache-Control": "no-cache",
          },
        },
      });

      if (currentSession?.user?.emailVerified) {
        setIsVerified(true);
      } else {
        setError("Email is not verified yet. Please click the link sent to your email.");
      }
    } catch (err: any) {
      setError("Failed to check status. Please try again.");
    } finally {
      setIsCheckingStatus(false);
    }
  }

  async function onResend(data: VerifyEmailFormData) {
    if (cooldownSeconds > 0) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { error: resendErr } = await authClient.sendVerificationEmail({
        email: data.email,
        callbackURL: "portl://verify-email",
      });

      if (resendErr) {
        throw new Error(resendErr.message || "Failed to send verification email");
      }

      setSuccessMessage(
        `Verification link sent to ${data.email}. Please check your inbox.`
      );
      // Start 2-minute (120 seconds) delay
      setCooldownSeconds(120);
    } catch (err: any) {
      setError(err.message || "Failed to resend verification link.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isVerifying) {
    return (
      <Card>
        <View className="items-center py-6 gap-3">
          <Spinner size="lg" color="amber" />
          <Text className="text-foreground-light dark:text-foreground-dark font-bold text-base">
            Verifying your email...
          </Text>
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs text-center">
            Please wait while we confirm your email address.
          </Text>
        </View>
      </Card>
    );
  }

  if (isVerified) {
    return (
      <Card>
        <View className="items-center py-4 gap-3">
          <Ionicons name="checkmark-circle" size={48} color="#10b981" />
          <Text className="text-foreground-light dark:text-foreground-dark font-bold text-lg text-center">
            Email Verified Successfully!
          </Text>
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs text-center px-2">
            Your email address has been verified. You can now start society onboarding.
          </Text>
          <Link href="/onboarding" asChild>
            <Pressable className="bg-primary-light dark:bg-primary-dark w-full py-3 rounded-xl items-center mt-2">
              <Text className="text-white font-bold text-sm">Start Onboarding</Text>
            </Pressable>
          </Link>
        </View>
      </Card>
    );
  }

  return (
    <Card>
      <Text className="text-foreground-light dark:text-foreground-dark font-bold text-base mb-1">
        Verify Your Email
      </Text>
      <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mb-4">
        You must verify your email address before starting society onboarding.
      </Text>

      {error && (
        <FieldError isInvalid className="mb-3 text-rose-500 text-xs">
          {error}
        </FieldError>
      )}

      {successMessage && (
        <View className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 gap-1.5 mb-4">
          <View className="flex-row items-center gap-2">
            <Ionicons name="mail-unread-outline" size={18} color="#10b981" />
            <Text className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              Verification Link Sent
            </Text>
          </View>
          <Text className="text-foreground-light dark:text-foreground-dark text-xs">
            {successMessage}
          </Text>
        </View>
      )}

      <View className="gap-4">
        <Controller
          control={control}
          name="email"
          render={({ field, fieldState: { error: fieldError } }) => (
            <TextField className="gap-1.5">
              <Label className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs uppercase tracking-wider font-semibold">
                Email Address
              </Label>
              <Input
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                placeholder="email@example.com"
                placeholderTextColor="#78716c"
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-4 py-3 text-sm focus:border-primary-light dark:focus:border-primary-dark"
              />
              {fieldError && (
                <FieldError isInvalid className="text-rose-500 text-xs mt-1">
                  {fieldError.message}
                </FieldError>
              )}
            </TextField>
          )}
        />

        <Button
          onPress={handleSubmit(onResend)}
          isDisabled={isLoading || cooldownSeconds > 0}
          className="mt-1 bg-primary-light dark:bg-primary-dark rounded-xl py-3 items-center justify-center active:opacity-90 disabled:opacity-50"
        >
          {isLoading ? (
            <Spinner size="sm" color="default" />
          ) : (
            <Button.Label className="text-white font-bold text-sm">
              {cooldownSeconds > 0
                ? `Resend in ${formatTime(cooldownSeconds)}`
                : "Resend Verification Email"}
            </Button.Label>
          )}
        </Button>

        <Pressable
          onPress={checkVerificationStatus}
          disabled={isCheckingStatus}
          className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark py-3 rounded-xl items-center justify-center active:opacity-80"
        >
          {isCheckingStatus ? (
            <Spinner size="sm" color="default" />
          ) : (
            <Text className="text-foreground-light dark:text-foreground-dark font-semibold text-xs">
              I've Verified My Email — Check Status
            </Text>
          )}
        </Pressable>
      </View>
    </Card>
  );
}
