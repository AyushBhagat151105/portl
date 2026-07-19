import React, { useRef } from "react";
import { Text, View, Pressable, TextInput, ActivityIndicator, Share, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldError } from "heroui-native";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as Haptics from "expo-haptics";
import { usePreApproveGuestMutation, useMyFlatsQuery } from "@/queries/society";
import { useToastStore } from "@/store/useToastStore";
import { ScreenContainer } from "@/components/ui/screen-container";
import { Card } from "@/components/ui/card";
import { QRCodeGen } from "@/components/ui/qr-code";
import { preApproveGuestSchema, type PreApproveGuestFormData } from "@/lib/form-schemas";

export function PreApproveView() {
  const { data: flats, isLoading } = useMyFlatsQuery();
  const preApproveMutation = usePreApproveGuestMutation();
  const { showToast } = useToastStore();
  const qrViewShotRef = useRef<ViewShot>(null);

  const [generatedCode, setGeneratedCode] = React.useState<string | null>(null);
  const [guestName, setGuestName] = React.useState("");

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<PreApproveGuestFormData>({
    resolver: zodResolver(preApproveGuestSchema),
    mode: "onTouched",
    defaultValues: { name: "", phone: "", purpose: "", flatId: "" },
  });

  React.useEffect(() => {
    if (flats && flats.length > 0) {
      setValue("flatId", flats[0].id);
    }
  }, [flats, setValue]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-zinc-950 items-center justify-center">
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  if (flats && flats.length === 0) {
    return (
      <ScreenContainer contentContainerStyle={{ padding: 24, justifyContent: "center", flexGrow: 1 }}>
        <Card className="p-8 items-center border border-amber-500/20 bg-amber-500/5">
          <Ionicons name="warning-outline" size={48} color="#d97706" style={{ marginBottom: 16 }} />
          <Text className="text-foreground-light dark:text-foreground-dark text-lg font-bold mb-2 text-center">
            No Flat Associated
          </Text>
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-sm text-center leading-relaxed">
            Your profile is not linked to any flat in this society yet. Please contact the society administrator/owner to assign you to a flat.
          </Text>
        </Card>
      </ScreenContainer>
    );
  }

  const onSubmit = async (data: PreApproveGuestFormData) => {
    try {
      const visitor = await preApproveMutation.mutateAsync({
        name: data.name,
        phone: data.phone,
        purpose: data.purpose,
        flatId: data.flatId,
      });
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setGeneratedCode(visitor.preApprovedCode);
      setGuestName(data.name);
      showToast("Guest invitation code generated!", "success");
      reset({ name: "", phone: "", purpose: "" });
    } catch (err: any) {
      showToast(err.message || "Failed to generate pass", "error");
    }
  };

  const handleShareQR = async () => {
    if (!generatedCode || !qrViewShotRef.current?.capture) return;
    try {
      // Capture the QR card view as a PNG image
      const uri = await qrViewShotRef.current.capture();

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: "Share Guest QR Code",
        });
      } else {
        await fallbackTextShare();
      }
    } catch {
      await fallbackTextShare();
    }
  };

  const fallbackTextShare = async () => {
    if (!generatedCode) return;
    try {
      await Share.share({
        message: `Your Portl Gate passcode for ${guestName || "your visit"}:\n\nCode: ${generatedCode}\n\nShow this code at the gate for instant entry.`,
        title: "Guest Access Code",
      });
    } catch {}
  };

  const handleShareCode = async () => {
    if (!generatedCode) return;
    try {
      await Share.share({
        message: generatedCode,
        title: "Guest Access Code",
      });
    } catch {}
  };

  return (
    <ScreenContainer contentContainerStyle={{ padding: 24 }}>
      <Card>
        <Text className="text-foreground-light dark:text-foreground-dark text-xl font-bold mb-4">
          Pre-Approve a Guest
        </Text>

        {generatedCode ? (
          <View className="items-center py-6">
            <Ionicons name="checkmark-circle-outline" size={48} color="#10b981" />
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-sm mt-3 mb-4">
              Show or share this QR code with your guest
            </Text>

            {/* This ViewShot wraps everything we want to capture as an image */}
            <ViewShot ref={qrViewShotRef} options={{ format: "png", quality: 1 }}>
              <View className="items-center bg-white rounded-2xl p-5" style={{ elevation: 4 }}>
                <QRCodeGen value={generatedCode} size={200} />
                <View className="mt-3 px-4 py-2 rounded-lg bg-zinc-100">
                  <Text className="text-zinc-900 text-2xl font-extrabold tracking-widest text-center">
                    {generatedCode}
                  </Text>
                </View>
                <Text className="text-zinc-500 text-[10px] text-center mt-2">
                  Portl Gate Guest Pass
                </Text>
              </View>
            </ViewShot>

            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs text-center px-4 mt-4 mb-5">
              Guest can show the QR code or share the 6-digit code at the gate.
            </Text>

            <View className="flex-row gap-3 w-full">
              <Pressable
                onPress={handleShareQR}
                className="flex-1 flex-row items-center justify-center gap-2 bg-primary-light dark:bg-primary-dark py-3 rounded-xl active:opacity-85"
              >
                <Ionicons name="share-social-outline" size={16} color="#ffffff" />
                <Text className="text-white font-semibold text-sm">Share QR</Text>
              </Pressable>
              <Pressable
                onPress={handleShareCode}
                className="flex-1 flex-row items-center justify-center gap-2 bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark py-3 rounded-xl active:opacity-85"
              >
                <Ionicons name="copy-outline" size={16} color="#a8a29e" />
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark font-semibold text-sm">Share Code</Text>
              </Pressable>
              <Pressable
                onPress={() => { setGeneratedCode(null); setGuestName(""); }}
                className="flex-row items-center justify-center px-3 py-3 rounded-xl bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark active:opacity-85"
              >
                <Ionicons name="add-outline" size={18} color="#a8a29e" />
              </Pressable>
            </View>
          </View>
        ) : (
          <View className="gap-4">
            <View>
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mb-1.5">
                Guest Name *
              </Text>
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <TextInput
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="e.g. John Doe"
                    placeholderTextColor="#78716c"
                    className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl py-3 px-4 focus:border-primary-light dark:focus:border-primary-dark"
                  />
                )}
              />
              {errors.name && (
                <FieldError isInvalid className="text-rose-500 text-xs mt-1">
                  {errors.name.message}
                </FieldError>
              )}
            </View>

            <View>
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mb-1.5">
                Guest Phone *
              </Text>
              <Controller
                control={control}
                name="phone"
                render={({ field }) => (
                  <TextInput
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="e.g. 9876543210"
                    placeholderTextColor="#78716c"
                    keyboardType="phone-pad"
                    className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl py-3 px-4 focus:border-primary-light dark:focus:border-primary-dark"
                  />
                )}
              />
              {errors.phone && (
                <FieldError isInvalid className="text-rose-500 text-xs mt-1">
                  {errors.phone.message}
                </FieldError>
              )}
            </View>

            <View>
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mb-1.5">
                Purpose (Optional)
              </Text>
              <Controller
                control={control}
                name="purpose"
                render={({ field }) => (
                  <TextInput
                    value={field.value ?? ""}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="e.g. Dinner Guest"
                    placeholderTextColor="#78716c"
                    className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl py-3 px-4 focus:border-primary-light dark:focus:border-primary-dark"
                  />
                )}
              />
            </View>

            <View>
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mb-1.5">
                Your Flat *
              </Text>
              {flats && flats.length > 0 ? (
                <Controller
                  control={control}
                  name="flatId"
                  render={({ field }) => (
                    <View className="flex-row gap-2 flex-wrap">
                      {flats.map((f: any) => {
                        const isSelected = field.value === f.id;
                        return (
                          <Pressable
                            key={f.id}
                            onPress={() => field.onChange(f.id)}
                            className={`py-2.5 px-4 rounded-xl border ${
                              isSelected
                                ? "bg-primary-light/10 dark:bg-primary-dark/10 border-primary-light dark:border-primary-dark"
                                : "bg-muted-light dark:bg-muted-dark border-border-light dark:border-border-dark"
                            }`}
                          >
                            <Text
                              className={`text-xs font-semibold ${
                                isSelected ? "text-primary-light dark:text-primary-dark" : "text-muted-foreground-light dark:text-muted-foreground-dark"
                              }`}
                            >
                              {f.tower.name} - {f.number}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  )}
                />
              ) : (
                <Text className="text-rose-500 text-xs">No registered flats found</Text>
              )}
              {errors.flatId && (
                <FieldError isInvalid className="text-rose-500 text-xs mt-1">
                  {errors.flatId.message}
                </FieldError>
              )}
            </View>

            <Pressable
              disabled={preApproveMutation.isPending}
              onPress={handleSubmit(onSubmit)}
              className="bg-primary-light dark:bg-primary-dark rounded-xl py-3.5 mt-2 items-center justify-center active:opacity-90"
            >
              {preApproveMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base">Generate Passcode</Text>
              )}
            </Pressable>
          </View>
        )}
      </Card>
    </ScreenContainer>
  );
}
export default PreApproveView;
