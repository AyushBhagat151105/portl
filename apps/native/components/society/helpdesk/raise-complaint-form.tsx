import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, Image, ActivityIndicator, Modal } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { FieldError } from "heroui-native";
import { FormInput } from "../../ui/form-input";
import { useCloudinaryUpload } from "../../../hooks/use-cloudinary-upload";
import { api } from "../../../lib/api";
import { useToastStore } from "../../../store/useToastStore";
import { raiseComplaintSchema, type RaiseComplaintFormData } from "../../../lib/form-schemas";

interface RaiseComplaintFormProps {
  onCancel: () => void;
  onSubmit: (data: RaiseComplaintFormData & { images: string[]; imagePublicIds: string[] }) => Promise<void>;
  isSubmitting: boolean;
  flats: any[];
}

const CATEGORIES = ["PLUMBING", "ELECTRICAL", "SECURITY", "CLEANLINESS", "OTHERS"] as const;

export function RaiseComplaintForm({
  onCancel,
  onSubmit,
  isSubmitting,
  flats,
}: RaiseComplaintFormProps) {
  const { showToast } = useToastStore();
  const [images, setImages] = useState<string[]>([]);
  const [imagePublicIds, setImagePublicIds] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<RaiseComplaintFormData>({
    resolver: zodResolver(raiseComplaintSchema),
    mode: "onTouched",
    defaultValues: {
      title: "",
      description: "",
      category: "PLUMBING",
      flatId: flats?.[0]?.id || "",
    },
  });

  const category = watch("category");
  const flatId = watch("flatId");

  const { upload, isUploading } = useCloudinaryUpload({
    folder: "complaints",
    type: "public",
    allowsEditing: true,
  });

  const handlePickImage = async () => {
    if (images.length >= 3) {
      showToast("Maximum 3 images allowed", "error");
      return;
    }
    const res = await upload();
    if (res) {
      setImages((prev) => [...prev, res.url]);
      setImagePublicIds((prev) => [...prev, res.publicId]);
      showToast("Image attached successfully", "success");
    }
  };

  const handleRemoveImage = async (index: number) => {
    const pubId = imagePublicIds[index];
    if (!pubId) return;
    try {
      await api.delete("/api/society/media/delete", {
        data: { publicId: pubId },
      });
      setImages((prev) => prev.filter((_, i) => i !== index));
      setImagePublicIds((prev) => prev.filter((_, i) => i !== index));
      showToast("Attachment removed", "info");
    } catch (err: any) {
      showToast("Failed to remove attachment", "error");
    }
  };

  const handleFormSubmit = (data: RaiseComplaintFormData) => {
    onSubmit({
      ...data,
      images,
      imagePublicIds,
    });
  };

  return (
    <View className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-5 rounded-3xl gap-4">
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-foreground-light dark:text-foreground-dark text-xl font-bold">
          Raise New Complaint
        </Text>
        <Pressable onPress={onCancel} accessibilityRole="button" accessibilityLabel="Cancel raising ticket">
          <Ionicons name="close-circle-outline" size={24} color="#78716c" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View className="gap-4 pb-4">
          {/* Category */}
          <View className="gap-1.5">
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs font-bold uppercase tracking-wider">
              Category
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setValue("category", cat)}
                    className={`py-2 px-3 rounded-lg border ${
                      isSelected
                        ? "bg-primary-light/10 dark:bg-primary-dark/10 border-primary-light dark:border-primary-dark"
                        : "bg-muted-light dark:bg-muted-dark border-border-light dark:border-border-dark"
                    }`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text className={`text-xs font-semibold ${isSelected ? "text-primary-light dark:text-primary-dark" : "text-muted-foreground-light dark:text-muted-foreground-dark"}`}>
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Title */}
          <FormInput
            control={control}
            name="title"
            label="Issue Title *"
            placeholder="e.g. Lift not working"
          />

          {/* Description */}
          <FormInput
            control={control}
            name="description"
            label="Describe the issue *"
            placeholder="Please provide details about the complaint..."
            multiline
            numberOfLines={4}
            className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl py-3 px-4 focus:border-primary-light dark:focus:border-primary-dark text-xs font-semibold min-h-[80px]"
          />

          {/* Flat Selection */}
          {flats.length > 1 && (
            <View className="gap-1.5">
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs font-bold uppercase tracking-wider">
                Select Flat
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {flats.map((flat) => {
                  const isSelected = flatId === flat.id;
                  return (
                    <Pressable
                      key={flat.id}
                      onPress={() => setValue("flatId", flat.id)}
                      className={`py-2 px-3 rounded-lg border ${
                        isSelected
                          ? "bg-primary-light/10 dark:bg-primary-dark/10 border-primary-light dark:border-primary-dark"
                          : "bg-muted-light dark:bg-muted-dark border-border-light dark:border-border-dark"
                      }`}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                    >
                      <Text className={`text-xs font-semibold ${isSelected ? "text-primary-light dark:text-primary-dark font-bold" : "text-muted-foreground-light dark:text-muted-foreground-dark"}`}>
                        {flat.tower.name} - {flat.number}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {/* Photos Attachment */}
          <View className="gap-1.5 mt-2 p-3 bg-muted-light/25 dark:bg-muted-dark/25 border border-border-light dark:border-border-dark rounded-2xl">
            <Text className="text-foreground-light dark:text-foreground-dark text-xs font-bold">
              Photos Attachment ({images.length}/3)
            </Text>
            
            {images.length > 0 && (
              <View className="flex-row gap-2.5 my-2">
                {images.map((img, idx) => (
                  <View key={img} className="relative w-16 h-16 rounded-xl border border-border-light dark:border-border-dark overflow-hidden">
                    <Pressable onPress={() => setSelectedImage(img)} className="w-full h-full">
                      <Image source={{ uri: img }} className="w-full h-full" />
                    </Pressable>
                    <Pressable
                      onPress={() => handleRemoveImage(idx)}
                      className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-1"
                      accessibilityRole="button"
                      accessibilityLabel="Remove attached image"
                    >
                      <Ionicons name="trash-outline" size={10} color="#ff3333" />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            {isUploading ? (
              <View className="flex-row items-center justify-center p-2.5 gap-2">
                <ActivityIndicator color="#f97316" size="small" />
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-bold">Uploading attachments...</Text>
              </View>
            ) : images.length < 3 ? (
              <Pressable
                onPress={handlePickImage}
                className="border border-dashed border-border-light dark:border-border-dark py-3.5 rounded-xl justify-center items-center flex-row gap-2 active:bg-muted-light/40 dark:active:bg-muted-dark/40"
                accessibilityRole="button"
                accessibilityLabel="Attach photo scan of issue"
              >
                <Ionicons name="camera-outline" size={16} color="#f97316" />
                <Text className="text-foreground-light dark:text-foreground-dark text-xs font-bold">Attach photo scan of issue</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </ScrollView>

      {/* Large View Image Modal overlay */}
      {selectedImage && (
        <Modal visible={true} transparent>
          <Pressable onPress={() => setSelectedImage(null)} className="flex-1 bg-black/95 justify-center items-center p-4">
            <Image source={{ uri: selectedImage }} className="w-full h-96 rounded-2xl" resizeMode="contain" />
            <Text className="text-white text-xs font-bold mt-4">Tap anywhere to close</Text>
          </Pressable>
        </Modal>
      )}

      {/* Submit Button */}
      <Pressable
        onPress={handleSubmit(handleFormSubmit)}
        disabled={isSubmitting}
        className="bg-primary-light dark:bg-primary-dark rounded-xl py-3.5 items-center active:opacity-90 disabled:opacity-50 mt-2"
        accessibilityRole="button"
        accessibilityLabel="Raise complaint ticket"
      >
        {isSubmitting ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text className="text-white font-bold text-base">Submit Complaint</Text>
        )}
      </Pressable>
    </View>
  );
}
export default RaiseComplaintForm;
