import React, { useState } from "react";
import { Text, View, Pressable, TextInput, ActivityIndicator, Image, ScrollView, Modal } from "react-native";
import { Chip } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldError } from "heroui-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { api } from "../../lib/api";
import { useComplaintsQuery, useRaiseComplaintMutation, useMyFlatsQuery } from "../../queries/society";
import { useToastStore } from "../../store/useToastStore";
import { ScreenContainer } from "../ui/screen-container";
import { Card, CardTitle, CardDescription } from "../ui/card";
import { Loader } from "../ui/loader";
import { raiseComplaintSchema, type RaiseComplaintFormData } from "@/lib/form-schemas";

export function HelpdeskView() {
  const { data: complaints, isLoading: complaintsLoading } = useComplaintsQuery();
  const raiseComplaintMutation = useRaiseComplaintMutation();
  const { data: flats, isLoading: flatsLoading } = useMyFlatsQuery();
  const { showToast } = useToastStore();

  const [isRaising, setIsRaising] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [imagePublicIds, setImagePublicIds] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<RaiseComplaintFormData>({
    resolver: zodResolver(raiseComplaintSchema),
    mode: "onTouched",
    defaultValues: {
      title: "",
      description: "",
      category: "PLUMBING",
      flatId: "",
    },
  });

  React.useEffect(() => {
    if (flats && flats.length > 0) {
      setValue("flatId", flats[0].id);
    }
  }, [flats, setValue]);

  if (complaintsLoading || flatsLoading) {
    return <Loader />;
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

  const handlePickImage = async () => {
    if (images.length >= 3) {
      showToast("Maximum 3 images allowed", "error");
      return;
    }

    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        showToast("Permission to access photo library is required!", "error");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0]!;
      setIsUploading(true);

      // 1. Fetch upload signature
      const sigRes = await api.get("/api/society/media/signature", {
        params: { folder: "complaints", type: "public" },
      });
      const { signature, timestamp, apiKey, cloudName, folder, type } = sigRes.data.data;

      // 2. Upload file to Cloudinary
      const fileUri = asset.uri;
      const fileName = fileUri.split("/").pop() || "complaint.jpg";
      const fileType = "image/jpeg";

      const formData = new FormData();
      formData.append("file", {
        uri: fileUri,
        name: fileName,
        type: fileType,
      } as any);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", folder);
      formData.append("type", type);

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      const cloudRes = await axios.post(uploadUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setImages((prev) => [...prev, cloudRes.data.secure_url]);
      setImagePublicIds((prev) => [...prev, cloudRes.data.public_id]);
      showToast("Image attached successfully", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to upload image", "error");
    } finally {
      setIsUploading(false);
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

  const onSubmit = async (data: RaiseComplaintFormData) => {
    try {
      await raiseComplaintMutation.mutateAsync({
        title: data.title,
        description: data.description,
        category: data.category,
        flatId: data.flatId,
        images,
        imagePublicIds,
      });
      reset({ title: "", description: "", category: "PLUMBING", flatId: flats?.[0]?.id ?? "" });
      setImages([]);
      setImagePublicIds([]);
      setIsRaising(false);
      showToast("Complaint ticket registered successfully!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to raise ticket", "error");
    }
  };

  const CATEGORIES = ["PLUMBING", "ELECTRICAL", "SECURITY", "CLEANLINESS", "OTHERS"] as const;

  return (
    <ScreenContainer contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
      {isRaising ? (
        <Card className="gap-4">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-foreground-light dark:text-foreground-dark text-xl font-bold">
              Raise New Complaint
            </Text>
            <Pressable onPress={() => setIsRaising(false)}>
              <Ionicons name="close-circle-outline" size={24} color="#78716c" />
            </Pressable>
          </View>

          <View className="gap-4">
            {/* Category */}
            <View>
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mb-1.5 font-bold uppercase tracking-wider">
                Category
              </Text>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <View className="flex-row flex-wrap gap-2">
                    {CATEGORIES.map((cat) => {
                      const isSelected = field.value === cat;
                      return (
                        <Pressable
                          key={cat}
                          onPress={() => field.onChange(cat)}
                          className={`py-2 px-3 rounded-lg border ${
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
                            {cat}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              />
            </View>

            {/* Title */}
            <View>
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mb-1.5 font-bold uppercase tracking-wider">
                Issue Title *
              </Text>
              <Controller
                control={control}
                name="title"
                render={({ field }) => (
                  <TextInput
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="e.g. Lift not working"
                    placeholderTextColor="#78716c"
                    className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl py-3 px-4 focus:border-primary-light dark:focus:border-primary-dark text-xs font-semibold"
                  />
                )}
              />
              {errors.title && (
                <FieldError isInvalid className="text-rose-500 text-xs mt-1">
                  {errors.title.message}
                </FieldError>
              )}
            </View>

            {/* Description */}
            <View>
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mb-1.5 font-bold uppercase tracking-wider">
                Details / Description *
              </Text>
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <TextInput
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="Describe the issue in detail"
                    placeholderTextColor="#78716c"
                    multiline
                    numberOfLines={3}
                    className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl py-3 px-4 h-24 focus:border-primary-light dark:focus:border-primary-dark text-xs"
                    style={{ textAlignVertical: "top" }}
                  />
                )}
              />
              {errors.description && (
                <FieldError isInvalid className="text-rose-500 text-xs mt-1">
                  {errors.description.message}
                </FieldError>
              )}
            </View>

            {/* Attachment picker */}
            <View className="gap-2 my-1">
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs font-bold uppercase tracking-wider">
                Attach Photos of the Problem (Optional, Max 3)
              </Text>
              
              <View className="flex-row items-center gap-3">
                {images.map((img, index) => (
                  <View key={img} className="relative w-16 h-16 rounded-xl overflow-hidden border border-border-light dark:border-border-dark">
                    <Image source={{ uri: img }} className="w-full h-full object-cover" />
                    <Pressable
                      onPress={() => handleRemoveImage(index)}
                      className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/75 items-center justify-center active:scale-95"
                    >
                      <Ionicons name="close" size={10} color="#f43f5e" />
                    </Pressable>
                  </View>
                ))}
                
                {images.length < 3 && (
                  <Pressable
                    disabled={isUploading}
                    onPress={handlePickImage}
                    className="w-16 h-16 rounded-xl border border-dashed border-border-light dark:border-border-dark items-center justify-center bg-muted-light dark:bg-muted-dark active:bg-muted-light/60 dark:active:bg-muted-dark/60"
                  >
                    {isUploading ? (
                      <ActivityIndicator size="small" color="#78716c" />
                    ) : (
                      <>
                        <Ionicons name="camera-outline" size={18} color="#78716c" />
                        <Text className="text-[9px] text-muted-foreground-light dark:text-muted-foreground-dark mt-0.5 font-bold">Add Photo</Text>
                      </>
                    )}
                  </Pressable>
                )}
              </View>
            </View>

            <Pressable
              disabled={raiseComplaintMutation.isPending || isUploading}
              onPress={handleSubmit(onSubmit)}
              className="bg-primary-light dark:bg-primary-dark rounded-xl py-3.5 mt-2 items-center justify-center active:opacity-90 disabled:opacity-50"
            >
              {raiseComplaintMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-xs uppercase tracking-wider">Submit Complaint</Text>
              )}
            </Pressable>
          </View>
        </Card>
      ) : (
        <View>
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-foreground-light dark:text-foreground-dark text-xl font-bold">
              Helpdesk Tickets
            </Text>
            <Pressable
              onPress={() => setIsRaising(true)}
              className="bg-primary-light/10 dark:bg-primary-dark/10 border border-primary-light/30 dark:border-primary-dark/30 px-3 py-1.5 rounded-lg active:opacity-85"
            >
              <Text className="text-primary-light dark:text-primary-dark text-xs font-semibold">+ Raise Issue</Text>
            </Pressable>
          </View>

          {complaintsLoading ? (
            <Loader fullscreen={false} />
          ) : !complaints || complaints.length === 0 ? (
            <Card className="p-6 items-center">
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-sm">
                No complaints logged yet.
              </Text>
            </Card>
          ) : (
            complaints.map((comp: any) => (
              <Card key={comp.id} className="mb-3">
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1 pr-2">
                    <CardTitle>{comp.title}</CardTitle>
                    <CardDescription>{comp.description}</CardDescription>
                  </View>
                  <View className="items-end">
                    <Chip
                      size="sm"
                      variant="soft"
                      color={
                        comp.status === "RESOLVED"
                          ? "success"
                          : comp.status === "IN_PROGRESS"
                          ? "accent"
                          : "warning"
                      }
                    >
                      <Chip.Label>{comp.status}</Chip.Label>
                    </Chip>
                  </View>
                </View>

                {comp.images && comp.images.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 mt-3 mb-1">
                    {comp.images.map((img: string, idx: number) => (
                      <Pressable
                        key={img + idx}
                        onPress={() => setSelectedImage(img)}
                        className="border border-border-light dark:border-border-dark rounded-xl overflow-hidden mr-2 active:scale-95"
                      >
                        <Image source={{ uri: img }} className="w-20 h-20 object-cover" />
                      </Pressable>
                    ))}
                  </ScrollView>
                )}

                <View className="flex-row justify-between items-center border-t border-border-light dark:border-border-dark pt-2.5 mt-2">
                  <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs">
                    Category: {comp.category}
                  </Text>
                  {comp.flat && (
                    <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs">
                      Flat: {comp.flat.tower.name} - {comp.flat.number}
                    </Text>
                  )}
                </View>
              </Card>
            ))
          )}
        </View>
      )}

      {/* Full-Screen Image Viewer Modal */}
      <Modal
        visible={!!selectedImage}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View className="flex-1 bg-black/95 justify-center items-center relative">
          {selectedImage && (
            <Image source={{ uri: selectedImage }} className="w-full h-5/6" resizeMode="contain" />
          )}
          <Pressable
            onPress={() => setSelectedImage(null)}
            className="absolute top-12 right-6 w-10 h-10 rounded-full bg-white/20 items-center justify-center active:scale-95"
          >
            <Ionicons name="close" size={24} color="white" />
          </Pressable>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
export default HelpdeskView;
