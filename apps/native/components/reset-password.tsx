import { Button, FieldError, Spinner, TextField, Label, Input } from "heroui-native";
import { useState } from "react";
import { Text, View, Pressable } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, Link } from "expo-router";
import { authClient } from "@/lib/auth-client";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/form-schemas";
import { Card } from "./ui/card";
import { Ionicons } from "@expo/vector-icons";

interface ResetPasswordProps {
  token?: string;
}

export function ResetPassword({ token: initialToken }: ResetPasswordProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const { control, handleSubmit, setValue } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onTouched",
    defaultValues: {
      token: initialToken || "",
    },
  });

  async function onSubmit(data: ResetPasswordFormData) {
    const resetToken = data.token || initialToken;
    if (!resetToken) {
      setError("Reset token is missing. Please click the reset link in your email again.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error: resetError } = await authClient.resetPassword({
        newPassword: data.password,
        token: resetToken,
      });

      if (resetError) {
        throw new Error(resetError.message || "Failed to reset password");
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "Invalid or expired token. Please request a new password reset.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <Text className="text-foreground-light dark:text-foreground-dark font-bold text-base mb-1">
        Set New Password
      </Text>
      <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mb-4">
        Enter a new secure password for your account.
      </Text>

      {error && (
        <FieldError isInvalid className="mb-3 text-rose-500 text-xs">
          {error}
        </FieldError>
      )}

      {isSuccess ? (
        <View className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 gap-3 my-2">
          <View className="flex-row items-center gap-2">
            <Ionicons name="checkmark-circle" size={22} color="#10b981" />
            <Text className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              Password Reset Successful!
            </Text>
          </View>
          <Text className="text-foreground-light dark:text-foreground-dark text-xs leading-relaxed">
            Your password has been updated successfully. You can now sign in with your new password.
          </Text>
          <Link href="/(auth)/sign-in" asChild>
            <Pressable className="bg-primary-light dark:bg-primary-dark py-3 rounded-xl items-center mt-2">
              <Text className="text-white font-bold text-sm">Sign In Now</Text>
            </Pressable>
          </Link>
        </View>
      ) : (
        <View className="gap-4">
          {!initialToken && (
            <Controller
              control={control}
              name="token"
              render={({ field, fieldState: { error: fieldError } }) => (
                <TextField className="gap-1.5">
                  <Label className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs uppercase tracking-wider font-semibold">
                    Reset Code / Token
                  </Label>
                  <Input
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="Paste reset token from email"
                    placeholderTextColor="#78716c"
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
          )}

          <Controller
            control={control}
            name="password"
            render={({ field, fieldState: { error: fieldError } }) => (
              <TextField className="gap-1.5">
                <Label className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs uppercase tracking-wider font-semibold">
                  New Password
                </Label>
                <Input
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="••••••••"
                  placeholderTextColor="#78716c"
                  secureTextEntry
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

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field, fieldState: { error: fieldError } }) => (
              <TextField className="gap-1.5">
                <Label className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs uppercase tracking-wider font-semibold">
                  Confirm New Password
                </Label>
                <Input
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="••••••••"
                  placeholderTextColor="#78716c"
                  secureTextEntry
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
                Update Password
              </Button.Label>
            )}
          </Button>
        </View>
      )}
    </Card>
  );
}
