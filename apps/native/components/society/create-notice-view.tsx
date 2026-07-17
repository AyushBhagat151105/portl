import React, { useState } from "react";
import { Text, View, Pressable, TextInput, ActivityIndicator, Image, useColorScheme } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldError } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { api } from "../../lib/api";
import { useCreateNoticeMutation, useNoticesQuery, useDeleteNoticeMutation } from "../../queries/society";
import { useToastStore } from "../../store/useToastStore";
import { ScreenContainer } from "../ui/screen-container";
import { Card } from "../ui/card";
import { DateChips } from "../ui/date-chips";
import { createNoticeSchema, type CreateNoticeFormData } from "@/lib/form-schemas";

export function CreateNoticeView() {
  const noticeMutation = useCreateNoticeMutation();
  const { data: notices, isLoading: noticesLoading } = useNoticesQuery();
  const deleteMutation = useDeleteNoticeMutation();
  const { showToast } = useToastStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [activeTab, setActiveTab] = useState<"publish" | "manage">("publish");
  const [banner, setBanner] = useState<string | null>(null);
  const [bannerPublicId, setBannerPublicId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const primaryColor = isDark ? "#f97316" : "#b45309";

  const { control, handleSubmit, reset, formState: { errors } } = useForm<CreateNoticeFormData>({
    resolver: zodResolver(createNoticeSchema),
    mode: "onTouched",
  });

  const handlePickBanner = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        showToast("Permission to access photo library is required!", "error");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0]!;
      setIsUploading(true);

      // 1. Fetch upload signature
      const sigRes = await api.get("/api/society/media/signature", {
        params: { folder: "notices", type: "public" },
      });
      const { signature, timestamp, apiKey, cloudName, folder, type } = sigRes.data.data;

      // 2. Upload file to Cloudinary
      const fileUri = asset.uri;
      const fileName = fileUri.split("/").pop() || "banner.jpg";
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

      setBanner(cloudRes.data.secure_url);
      setBannerPublicId(cloudRes.data.public_id);
      showToast("Banner uploaded successfully!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to upload banner", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveBanner = async () => {
    if (!bannerPublicId) return;
    try {
      await api.delete("/api/society/media/delete", {
        data: { publicId: bannerPublicId },
      });
      setBanner(null);
      setBannerPublicId(null);
      showToast("Banner removed", "info");
    } catch (err: any) {
      showToast("Failed to delete banner from server", "error");
    }
  };

  const handleDelete = async (noticeId: string) => {
    try {
      await deleteMutation.mutateAsync(noticeId);
      showToast("Notice deleted successfully!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to delete notice", "error");
    }
  };

  const onSubmit = async (data: CreateNoticeFormData) => {
    try {
      await noticeMutation.mutateAsync({
        title: data.title,
        content: data.content,
        banner,
        bannerPublicId,
        endDate: data.endDate || null,
      });
      showToast("Notice announcement published successfully!", "success");
      setBanner(null);
      setBannerPublicId(null);
      reset();
      setActiveTab("manage");
    } catch (err: any) {
      showToast(err.message || "Failed to publish notice", "error");
    }
  };

  return (
    <ScreenContainer contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
      {/* Selection Tabs */}
      <View className="flex-row bg-muted-light dark:bg-muted-dark p-1 rounded-2xl mb-4.5 border border-border-light/20 dark:border-border-dark/20">
        <Pressable
          onPress={() => setActiveTab("publish")}
          className={`flex-1 py-3 rounded-xl items-center justify-center ${
            activeTab === "publish" ? "bg-white dark:bg-zinc-800 shadow-sm" : ""
          }`}
        >
          <Text
            className={`text-xs font-bold uppercase tracking-wider ${
              activeTab === "publish"
                ? "text-primary-light dark:text-primary-dark"
                : "text-muted-foreground-light dark:text-muted-foreground-dark"
            }`}
          >
            Create Notice
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("manage")}
          className={`flex-1 py-3 rounded-xl items-center justify-center ${
            activeTab === "manage" ? "bg-white dark:bg-zinc-800 shadow-sm" : ""
          }`}
        >
          <Text
            className={`text-xs font-bold uppercase tracking-wider ${
              activeTab === "manage"
                ? "text-primary-light dark:text-primary-dark"
                : "text-muted-foreground-light dark:text-muted-foreground-dark"
            }`}
          >
            Manage Board
          </Text>
        </Pressable>
      </View>

      {activeTab === "publish" ? (
        <Card className="gap-5">
          <View className="flex-row justify-between items-center border-b border-border-light dark:border-border-dark pb-3">
            <View className="flex-1 pr-2">
              <Text className="text-foreground-light dark:text-foreground-dark text-lg font-bold">
                Publish Announcement
              </Text>
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs mt-0.5">
                Broadcast critical updates or notices to all society residents
              </Text>
            </View>
            <Ionicons name="megaphone-outline" size={24} color={primaryColor} />
          </View>

          <View className="gap-4">
            {/* Banner Upload Field */}
            <View className="gap-1.5">
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs font-bold uppercase tracking-wider">
                Cover Banner Image (Optional)
              </Text>
              {isUploading ? (
                <View className="h-40 rounded-2xl bg-muted-light dark:bg-muted-dark border border-dashed border-border-light dark:border-border-dark items-center justify-center">
                  <ActivityIndicator size="small" color={primaryColor} />
                  <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs mt-2 font-semibold">Uploading cover image...</Text>
                </View>
              ) : banner ? (
                <View className="relative rounded-2xl overflow-hidden border border-border-light dark:border-border-dark animate-fade-in">
                  <Image source={{ uri: banner }} className="w-full h-40 object-cover" />
                  <Pressable
                    onPress={handleRemoveBanner}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 items-center justify-center active:scale-95"
                  >
                    <Ionicons name="trash" size={14} color="#f43f5e" />
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={handlePickBanner}
                  className="h-40 rounded-2xl bg-muted-light dark:bg-muted-dark border border-dashed border-border-light dark:border-border-dark items-center justify-center gap-1.5 active:bg-muted-light/60 dark:active:bg-muted-dark/60"
                >
                  <Ionicons name="image-outline" size={26} color="#78716c" />
                  <Text className="text-foreground-light dark:text-foreground-dark text-xs font-bold">Pick Banner Photo</Text>
                  <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-[10px]">JPEG/PNG up to 5MB (16:9 ratio)</Text>
                </Pressable>
              )}
            </View>

            <View className="gap-1.5">
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs font-bold uppercase tracking-wider">
                Notice Title *
              </Text>
              <Controller
                control={control}
                name="title"
                render={({ field }) => (
                  <TextInput
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="e.g. Lift Maintenance Schedule"
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

            <View className="gap-1.5">
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs font-bold uppercase tracking-wider">
                Notice Body Content *
              </Text>
              <Controller
                control={control}
                name="content"
                render={({ field }) => (
                  <TextInput
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="Announce details to all residents..."
                    placeholderTextColor="#78716c"
                    multiline
                    numberOfLines={4}
                    className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl py-3 px-4 h-28 focus:border-primary-light dark:focus:border-primary-dark text-xs"
                    style={{ textAlignVertical: "top" }}
                  />
                )}
              />
              {errors.content && (
                <FieldError isInvalid className="text-rose-500 text-xs mt-1">
                  {errors.content.message}
                </FieldError>
              )}
            </View>

            <View className="gap-1.5">
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs font-bold uppercase tracking-wider">
                Expiry End Date (Optional)
              </Text>
              <Controller
                control={control}
                name="endDate"
                render={({ field }) => (
                  <View className="gap-2.5">
                    <DateChips value={field.value || ""} onChange={field.onChange} daysToShow={30} />
                    {field.value ? (
                      <Pressable
                        onPress={() => field.onChange("")}
                        className="self-start px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg active:scale-95"
                      >
                        <Text className="text-rose-500 text-[10px] font-bold uppercase tracking-wider">Clear Date</Text>
                      </Pressable>
                    ) : null}
                  </View>
                )}
              />
              {errors.endDate && (
                <FieldError isInvalid className="text-rose-500 text-xs mt-1">
                  {errors.endDate.message}
                </FieldError>
              )}
            </View>

            <Pressable
              disabled={noticeMutation.isPending || isUploading}
              onPress={handleSubmit(onSubmit)}
              className="bg-primary-light dark:bg-primary-dark rounded-xl py-3.5 mt-2 items-center justify-center active:opacity-90 disabled:opacity-50"
            >
              {noticeMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-xs uppercase tracking-wider">Announce & Broadcast</Text>
              )}
            </Pressable>
          </View>
        </Card>
      ) : (
        <View className="gap-4">
          <Text className="text-foreground-light dark:text-foreground-dark text-lg font-bold">
            Published Announcements
          </Text>

          {noticesLoading ? (
            <ActivityIndicator color={primaryColor} size="small" className="py-12" />
          ) : !notices || notices.length === 0 ? (
            <Card className="py-12 items-center justify-center border border-border-light dark:border-border-dark">
              <Ionicons name="notifications-off-outline" size={32} color="#78716c" />
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-2.5 font-medium">
                No active announcements published.
              </Text>
            </Card>
          ) : (
            notices.map((not: any) => (
              <Card key={not.id} className="overflow-hidden border border-border-light dark:border-border-dark p-0 mb-3 bg-muted-light/10 dark:bg-muted-dark/5">
                {not.banner && (
                  <Image source={{ uri: not.banner }} className="w-full h-28 object-cover" />
                )}
                <View className="p-4 gap-2">
                  <View className="flex-row justify-between items-start">
                    <Text className="text-foreground-light dark:text-foreground-dark font-extrabold text-sm flex-1 mr-2 leading-snug" numberOfLines={2}>
                      {not.title}
                    </Text>
                    <Pressable
                      disabled={deleteMutation.isPending}
                      onPress={() => handleDelete(not.id)}
                      className="w-7 h-7 rounded-full bg-rose-500/10 items-center justify-center active:scale-95 disabled:opacity-50"
                    >
                      <Ionicons name="trash" size={13} color="#f43f5e" />
                    </Pressable>
                  </View>
                  <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs leading-relaxed" numberOfLines={4}>
                    {not.content}
                  </Text>
                  
                  <View className="flex-row justify-between items-center border-t border-border-light/40 dark:border-border-dark/40 pt-2.5 mt-1">
                    <View className="flex-row items-center gap-1.5">
                      {not.author?.image ? (
                        <Image source={{ uri: not.author.image }} className="w-3.5 h-3.5 rounded-full" />
                      ) : (
                        <View className="w-3.5 h-3.5 rounded-full bg-muted-light dark:bg-muted-dark items-center justify-center">
                          <Ionicons name="person" size={8} color="#78716c" />
                        </View>
                      )}
                      <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-[10px] font-bold">
                        {not.author?.name}
                      </Text>
                    </View>

                    {not.endDate ? (
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="time-outline" size={10} color="#f43f5e" />
                        <Text className="text-rose-500 dark:text-rose-400 text-[9px] font-semibold uppercase tracking-wider">
                          Expires: {new Date(not.endDate).toLocaleDateString([], { month: "short", day: "numeric" })}
                        </Text>
                      </View>
                    ) : (
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="calendar-outline" size={10} color="#78716c" />
                        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-[9px] font-medium">
                          {new Date(not.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </Card>
            ))
          )}
        </View>
      )}
    </ScreenContainer>
  );
}
export default CreateNoticeView;
