import React, { useEffect } from "react";
import { View, Text, Pressable, Image, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormModal } from "../../ui/form-modal";
import { FormInput } from "../../ui/form-input";
import { useCloudinaryUpload } from "../../../hooks/use-cloudinary-upload";
import { createStaffSchema, type CreateStaffFormData } from "../../../lib/form-schemas";

const STAFF_ROLES = ["MAID", "DRIVER", "PLUMBER", "COOK", "ELECTRICIAN", "GARDENER", "SECURITY", "OTHER"];

const roleColors: Record<string, string> = {
  MAID: "#f59e0b",
  DRIVER: "#38bdf8",
  PLUMBER: "#a78bfa",
  COOK: "#fb923c",
  ELECTRICIAN: "#facc15",
  GARDENER: "#34d399",
  SECURITY: "#f43f5e",
  OTHER: "#6b7280",
};

interface StaffFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateStaffFormData) => Promise<void>;
  isSubmitting: boolean;
  defaultValues?: Partial<CreateStaffFormData> | null;
  title: string;
  primaryColor: string;
  isDark: boolean;
}

export function StaffFormModal({
  visible,
  onClose,
  onSubmit,
  isSubmitting,
  defaultValues,
  title,
  primaryColor,
  isDark,
}: StaffFormModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
  } = useForm<CreateStaffFormData>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: {
      name: "",
      phone: "",
      role: "MAID",
      code: "",
      aadharNumber: "",
      aadharPublicId: "",
      vehicleNumber: "",
      avatar: "",
    },
  });

  // Reset form when defaultValues changes (e.g., when opening edit mode)
  useEffect(() => {
    if (defaultValues) {
      reset({
        name: defaultValues.name || "",
        phone: defaultValues.phone || "",
        role: defaultValues.role || "MAID",
        code: defaultValues.code || "",
        aadharNumber: defaultValues.aadharNumber || "",
        aadharPublicId: defaultValues.aadharPublicId || "",
        vehicleNumber: defaultValues.vehicleNumber || "",
        avatar: defaultValues.avatar || "",
      });
    } else {
      reset({
        name: "",
        phone: "",
        role: "MAID",
        code: "",
        aadharNumber: "",
        aadharPublicId: "",
        vehicleNumber: "",
        avatar: "",
      });
    }
  }, [defaultValues, reset, visible]);

  // Cloudinary upload hooks
  const { upload: uploadAvatar, isUploading: isUploadingAvatar } = useCloudinaryUpload({
    folder: "profiles",
    type: "public",
    aspect: [1, 1],
  });

  const { upload: uploadAadhar, isUploading: isUploadingAadhar } = useCloudinaryUpload({
    folder: "documents",
    type: "private",
    allowsEditing: false,
  });

  const avatar = watch("avatar");
  const aadharPublicId = watch("aadharPublicId");
  const role = watch("role");

  const handlePickAvatar = async () => {
    const res = await uploadAvatar();
    if (res?.url) {
      setValue("avatar", res.url);
    }
  };

  const handlePickAadhar = async () => {
    const res = await uploadAadhar();
    if (res?.publicId) {
      setValue("aadharPublicId", res.publicId);
    }
  };

  return (
    <FormModal
      visible={visible}
      onClose={onClose}
      title={title}
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitLabel="Save Staff"
      maxHeight={440}
    >
      {/* Profile Pic Upload Widget */}
      <View className="items-center mb-2">
        <View className="relative">
          <View className="w-16 h-16 rounded-full overflow-hidden bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark justify-center items-center">
            {isUploadingAvatar ? (
              <ActivityIndicator color={primaryColor} size="small" />
            ) : avatar ? (
              <Image source={{ uri: avatar }} className="w-full h-full" />
            ) : (
              <Ionicons name="person" size={24} color="#78716c" />
            )}
          </View>
          <Pressable
            onPress={handlePickAvatar}
            className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-primary-light dark:bg-primary-dark items-center justify-center border border-card-light dark:border-card-dark active:scale-95"
            accessibilityRole="button"
            accessibilityLabel="Upload staff photo"
          >
            <Ionicons name="camera" size={10} color="#ffffff" />
          </Pressable>
        </View>
        {avatar ? (
          <Pressable onPress={() => setValue("avatar", "")} className="mt-1" accessibilityRole="button">
            <Text className="text-rose-500 text-[10px] font-bold">Remove photo</Text>
          </Pressable>
        ) : null}
      </View>

      {/* Name Input */}
      <FormInput
        control={control}
        name="name"
        label="Name *"
        placeholder="e.g. Ramesh Kumar"
      />

      {/* Phone Input */}
      <FormInput
        control={control}
        name="phone"
        label="Phone *"
        placeholder="e.g. +91 98765 43210"
        keyboardType="phone-pad"
      />

      {/* Role Picker */}
      <View className="gap-1.5">
        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">
          Role *
        </Text>
        <View className="flex-row flex-wrap gap-1.5">
          {STAFF_ROLES.map((r) => {
            const isSelected = role === r;
            const roleColor = roleColors[r] || "#6b7280";
            return (
              <Pressable
                key={r}
                onPress={() => setValue("role", r)}
                className={`px-2 py-1 rounded-lg border`}
                style={{
                  borderColor: isSelected ? roleColor : (isDark ? "#44403c" : "#e4d9bc"),
                  backgroundColor: isSelected ? `${roleColor}18` : "transparent",
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
              >
                <Text
                  className="text-[10px] font-bold capitalize"
                  style={{ color: isSelected ? roleColor : "#78716c" }}
                >
                  {r.charAt(0) + r.slice(1).toLowerCase()}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Badge/Code Input */}
      <FormInput
        control={control}
        name="code"
        label="Badge / Code"
        placeholder="Card or ID number"
        autoCapitalize="characters"
      />

      {/* Aadhar Number Input */}
      <FormInput
        control={control}
        name="aadharNumber"
        label="Aadhar Number"
        placeholder="12 Digit Aadhar"
        keyboardType="numeric"
        maxLength={12}
      />

      {/* Aadhar Photo Attachment */}
      <View className="gap-1.5 bg-muted-light/30 dark:bg-muted-dark/30 p-2.5 rounded-xl border border-border-light dark:border-border-dark">
        <Text className="text-foreground-light dark:text-foreground-dark text-[10px] font-semibold">
          Aadhar Attachment
        </Text>
        {isUploadingAadhar ? (
          <View className="flex-row items-center justify-center p-2 gap-1.5">
            <ActivityIndicator color={primaryColor} size="small" />
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-[10px]">Uploading...</Text>
          </View>
        ) : aadharPublicId ? (
          <View className="flex-row justify-between items-center bg-card-light dark:bg-card-dark border border-emerald-500/20 p-2 rounded-lg">
            <Text className="text-emerald-500 font-bold text-[10px]">Aadhar document set</Text>
            <Pressable
              onPress={() => setValue("aadharPublicId", "")}
              className="p-1 rounded bg-rose-500/10 border border-rose-500/20"
              accessibilityRole="button"
              accessibilityLabel="Remove Aadhar document"
            >
              <Ionicons name="trash-outline" size={10} color="#ef4444" />
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={handlePickAadhar}
            className="border border-dashed border-border-light dark:border-border-dark py-2.5 rounded-lg justify-center items-center flex-row gap-1.5 active:bg-muted-light/50 dark:active:bg-muted-dark/50"
            accessibilityRole="button"
            accessibilityLabel="Attach Aadhar photo document"
          >
            <Ionicons name="cloud-upload-outline" size={12} color={primaryColor} />
            <Text className="text-foreground-light dark:text-foreground-dark text-[10px] font-bold">
              Attach document photo
            </Text>
          </Pressable>
        )}
      </View>

      {/* Vehicle Number Input */}
      <FormInput
        control={control}
        name="vehicleNumber"
        label="Vehicle Number"
        placeholder="e.g. MH12AB1234"
        autoCapitalize="characters"
      />
    </FormModal>
  );
}
export default StaffFormModal;
