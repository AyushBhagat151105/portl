import { Button, FieldError, Spinner, TextField, Label, Input } from "heroui-native";
import { useState } from "react";
import { Text, View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { authClient } from "@/lib/auth-client";
import { signUpSchema, type SignUpFormData } from "@/lib/form-schemas";
import { Card } from "./ui/card";
import { api } from "@/lib/api";
import { useSocietyStore } from "@/store/useSocietyStore";

interface SignUpProps {
  isSubmittingRef?: React.MutableRefObject<boolean>;
}

export function SignUp({ isSubmittingRef }: SignUpProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { setRole } = useSocietyStore();

  const { control, handleSubmit } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: "onTouched",
  });

  async function onSubmit(data: SignUpFormData) {
    setIsLoading(true);
    setError(null);
    if (isSubmittingRef) {
      isSubmittingRef.current = true;
    }

    try {
      await authClient.signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      await authClient.getSession();

      // Fetch user membership directly to find role and redirect target
      const memberRes = await api.get("/api/society/my-membership");
      const membership = memberRes.data?.data;

      // Sync role into Zustand store before routing
      if (membership?.role) {
        const serverRole = membership.role.toLowerCase();
        if (serverRole === "admin" || serverRole === "owner" || serverRole === "resident" || serverRole === "guard") {
          setRole(serverRole === "owner" ? "admin" : (serverRole as "admin" | "resident" | "guard"));
        }
      }

      // Brief window for SecureStore write and navigation context to sync
      await new Promise((resolve) => setTimeout(resolve, 200));

      if (membership) {
        const role = membership.role?.toLowerCase();
        if (role === "admin" || role === "owner") {
          router.replace("/(drawer)/admin/dashboard");
        } else if (role === "guard") {
          router.replace("/(drawer)/guard/dashboard");
        } else {
          router.replace("/(drawer)/resident/dashboard");
        }
      } else {
        router.replace("/onboarding");
      }
    } catch (err: any) {
      if (isSubmittingRef) {
        isSubmittingRef.current = false;
      }
      setError(err.message || "Failed to sign up");
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <Text className="text-foreground-light dark:text-foreground-dark font-bold text-base mb-4">
        Create Account
      </Text>

      <FieldError isInvalid={!!error} className="mb-3 text-rose-500">
        {error}
      </FieldError>

      <View className="gap-4">
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState: { error: fieldError } }) => (
            <TextField className="gap-1.5">
              <Label className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs uppercase tracking-wider font-semibold">
                Name
              </Label>
              <Input
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                placeholder="John Doe"
                placeholderTextColor="#78716c"
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

        <Controller
          control={control}
          name="password"
          render={({ field, fieldState: { error: fieldError } }) => (
            <TextField className="gap-1.5">
              <Label className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs uppercase tracking-wider font-semibold">
                Password
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

        <Button onPress={handleSubmit(onSubmit)} isDisabled={isLoading} className="mt-2 bg-primary-light dark:bg-primary-dark rounded-xl py-3 items-center justify-center active:opacity-90">
          {isLoading ? (
            <Spinner size="sm" color="default" />
          ) : (
            <Button.Label className="text-white font-bold text-sm">Create Account</Button.Label>
          )}
        </Button>
      </View>
    </Card>
  );
}
export default SignUp;
