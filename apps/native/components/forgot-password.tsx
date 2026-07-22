import { Button, FieldError, Spinner, TextField, Label, Input } from "heroui-native";
import { useState } from "react";
import { Text, View, Pressable } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, Link } from "expo-router";
import { authClient } from "@/lib/auth-client";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/form-schemas";
import { Card } from "./ui/card";
import { Ionicons } from "@expo/vector-icons";

export function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  const { control, handleSubmit } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onTouched",
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { error: resetError } = await authClient.requestPasswordReset({
        email: data.email,
        redirectTo: "portl://reset-password",
      });

      if (resetError) {
        throw new Error(resetError.message || "Failed to send password reset email");
      }

      setSuccessMessage(
        "A password reset link has been sent to your email. Please check your inbox and click the link to reset your password."
      );
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <Text className="text-foreground-light dark:text-foreground-dark font-bold text-base mb-1">
        Reset Password
      </Text>
      <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mb-4">
        Enter your registered email address and we'll send you instructions to reset your password.
      </Text>

      {error && (
        <FieldError isInvalid className="mb-3 text-rose-500 text-xs">
          {error}
        </FieldError>
      )}

      {successMessage ? (
        <View className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 gap-3 my-2">
          <View className="flex-row items-center gap-2">
            <Ionicons name="checkmark-circle-outline" size={20} color="#10b981" />
            <Text className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              Email Sent
            </Text>
          </View>
          <Text className="text-foreground-light dark:text-foreground-dark text-xs leading-relaxed">
            {successMessage}
          </Text>
          <Link href="/(auth)/sign-in" asChild>
            <Pressable className="bg-emerald-600 dark:bg-emerald-500 py-2.5 rounded-lg items-center mt-2">
              <Text className="text-white font-semibold text-xs">Return to Sign In</Text>
            </Pressable>
          </Link>
        </View>
      ) : (
        <View className="gap-4">
          <Controller
            control={control}
            name="email"
            render={({ field, fieldState: { error: fieldError } }) => (
              <TextField className="gap-1.5">
                <Label className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs uppercase tracking-wider font-semibold">
                  Email
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
            onPress={handleSubmit(onSubmit)}
            isDisabled={isLoading}
            className="mt-2 bg-primary-light dark:bg-primary-dark rounded-xl py-3 items-center justify-center active:opacity-90"
          >
            {isLoading ? (
              <Spinner size="sm" color="default" />
            ) : (
              <Button.Label className="text-white font-bold text-sm">
                Send Reset Link
              </Button.Label>
            )}
          </Button>
        </View>
      )}
    </Card>
  );
}
