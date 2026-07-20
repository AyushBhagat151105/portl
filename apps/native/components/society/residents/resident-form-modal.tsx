import React, { useEffect } from "react";
import { View, Text, Pressable, Image, ActivityIndicator } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { FormModal } from "../../ui/form-modal";
import { FormInput } from "../../ui/form-input";
import { useCloudinaryUpload } from "../../../hooks/use-cloudinary-upload";
import { useToastStore } from "../../../store/useToastStore";
import {
  createResidentSchema,
  updateResidentSchema,
} from "../../../lib/form-schemas";

interface ResidentFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
  defaultValues?: any | null;
  mode: "create" | "edit";
  title: string;
}

export function ResidentFormModal({
  visible,
  onClose,
  onSubmit,
  isSubmitting,
  defaultValues,
  mode,
  title,
}: ResidentFormModalProps) {
  const currentSchema = mode === "create" ? createResidentSchema : updateResidentSchema;
  const { showToast } = useToastStore();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
  } = useForm<any>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      aadharNumber: "",
      image: "",
      aadharPublicId: "",
    },
  });

  const avatarImage = watch("image");
  const aadharPublicId = watch("aadharPublicId");

  const { upload: uploadAvatar, isUploading: isUploadingAvatar } = useCloudinaryUpload({
    folder: "avatars",
    type: "public",
    allowsEditing: true,
  });

  const { upload: uploadAadhar, isUploading: isUploadingAadhar } = useCloudinaryUpload({
    folder: "documents",
    type: "private",
    allowsEditing: false,
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        name: defaultValues.name || defaultValues.user?.name || "",
        email: defaultValues.email || defaultValues.user?.email || "",
        phone: defaultValues.phoneNumber || defaultValues.user?.phoneNumber || "",
        password: "",
        aadharNumber: defaultValues.aadharNumber || defaultValues.user?.aadharNumber || "",
        image: defaultValues.image || defaultValues.user?.image || "",
        aadharPublicId: defaultValues.aadharPublicId || defaultValues.user?.aadharPublicId || "",
      });
    } else {
      reset({
        name: "",
        email: "",
        phone: "",
        password: "",
        aadharNumber: "",
        image: "",
        aadharPublicId: "",
      });
    }
  }, [defaultValues, reset, visible]);

  const handlePickAvatar = async () => {
    const res = await uploadAvatar();
    if (res?.url) {
      setValue("image", res.url, { shouldValidate: true });
      showToast("Avatar image uploaded!", "success");
    }
  };

  const handlePickAadhar = async () => {
    const res = await uploadAadhar();
    if (res?.publicId) {
      setValue("aadharPublicId", res.publicId, { shouldValidate: true });
      showToast("Aadhar document attached securely!", "success");
    }
  };

  return (
    <FormModal
      visible={visible}
      onClose={onClose}
      title={title}
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting || isUploadingAvatar || isUploadingAadhar}
      submitLabel={mode === "create" ? "Save Resident" : "Update Profile"}
    >
      <View className="gap-5">
        {/* Interactive Avatar Image Uploader */}
        <View className="items-center mb-1 gap-2.5">
          {avatarImage ? (
            <View className="relative w-20 h-20 rounded-full border border-border-light dark:border-border-dark overflow-hidden">
              <Image source={{ uri: avatarImage }} className="w-full h-full" />
              <Pressable
                onPress={() => setValue("image", "", { shouldValidate: true })}
                className="absolute inset-0 bg-black/40 items-center justify-center active:bg-black/60"
                accessibilityRole="button"
                accessibilityLabel="Remove photo"
              >
                <Ionicons name="trash-outline" size={18} color="#f43f5e" />
              </Pressable>
            </View>
          ) : isUploadingAvatar ? (
            <View className="w-20 h-20 rounded-full bg-muted-light dark:bg-muted-dark items-center justify-center border border-border-light dark:border-border-dark">
              <ActivityIndicator color="#f97316" size="small" />
            </View>
          ) : (
            <Pressable
              onPress={handlePickAvatar}
              className="w-20 h-20 rounded-full bg-muted-light dark:bg-muted-dark border border-dashed border-border-light dark:border-border-dark items-center justify-center active:bg-muted-light/60"
              accessibilityRole="button"
              accessibilityLabel="Upload photo"
            >
              <Ionicons name="camera-outline" size={24} color="#78716c" />
              <Text className="text-[10px] text-zinc-500 font-bold mt-1">Add Photo</Text>
            </Pressable>
          )}
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-[10px] font-bold uppercase tracking-wider">
            Resident Profile Avatar
          </Text>
        </View>

        {/* Name Input */}
        <FormInput
          control={control}
          name="name"
          label="Full Name *"
          placeholder="e.g. Rahul Sharma"
        />

        {/* Email Input */}
        <FormInput
          control={control}
          name="email"
          label="Email Address *"
          placeholder="e.g. rahul@gmail.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Phone Input */}
        <FormInput
          control={control}
          name="phone"
          label="Phone Number"
          placeholder="e.g. +919876543210"
          keyboardType="phone-pad"
          autoCapitalize="none"
        />

        {/* Password Input (Create mode only) */}
        {mode === "create" && (
          <FormInput
            control={control}
            name="password"
            label="Password *"
            placeholder="Min 6 characters"
            secureTextEntry
            autoCapitalize="none"
          />
        )}

        {/* Aadhar Input */}
        <FormInput
          control={control}
          name="aadharNumber"
          label="Aadhar Number"
          placeholder="12 Digit Aadhar"
          keyboardType="numeric"
          maxLength={12}
        />

        {/* Private Aadhar Secured Document Uploader */}
        <View className="gap-2 p-3 bg-muted-light/20 dark:bg-muted-dark/20 border border-border-light dark:border-border-dark rounded-2xl">
          <Text className="text-foreground-light dark:text-foreground-dark text-xs font-bold">
            Secured Aadhar Scan File
          </Text>
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-[10px] leading-3.5 mb-1">
            Uploaded securely to a private database bucket. Only admins and the owner can view this file via signed temporary download URLs.
          </Text>

          {aadharPublicId ? (
            <View className="flex-row items-center justify-between bg-primary-light/10 dark:bg-primary-dark/10 border border-primary-light/20 dark:border-primary-dark/20 p-2.5 rounded-xl">
              <View className="flex-row items-center gap-2">
                <Ionicons name="shield-checkmark" size={16} color="#f59e0b" />
                <Text className="text-primary-light dark:text-primary-dark text-xs font-extrabold font-mono">
                  Document Attached
                </Text>
              </View>
              <Pressable
                onPress={() => setValue("aadharPublicId", "", { shouldValidate: true })}
                className="bg-rose-500/10 border border-rose-500/20 py-1.5 px-3 rounded-lg active:scale-95"
                accessibilityRole="button"
                accessibilityLabel="Remove Aadhar document scan"
              >
                <Text className="text-rose-500 text-xxs font-bold uppercase tracking-wider">Remove</Text>
              </Pressable>
            </View>
          ) : isUploadingAadhar ? (
            <View className="flex-row items-center justify-center py-3 gap-2">
              <ActivityIndicator color="#f97316" size="small" />
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs font-bold">Uploading scan...</Text>
            </View>
          ) : (
            <Pressable
              onPress={handlePickAadhar}
              className="border border-dashed border-border-light dark:border-border-dark py-3 rounded-xl justify-center items-center flex-row gap-2 active:bg-muted-light/40 dark:active:bg-muted-dark/40"
              accessibilityRole="button"
              accessibilityLabel="Upload Aadhar secure document scan"
            >
              <Ionicons name="document-attach-outline" size={16} color="#f59e0b" />
              <Text className="text-foreground-light dark:text-foreground-dark text-xs font-bold">Upload Aadhar Secure Scan</Text>
            </Pressable>
          )}
        </View>
      </View>
    </FormModal>
  );
}
export default ResidentFormModal;
