import React, { useState } from "react";
import { View, Text, Pressable, TextInput, ActivityIndicator, Image, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldError } from "heroui-native";
import { useCreateNoticeMutation, useDeleteNoticeMutation } from "../../queries/admin";
import { useNoticesQuery } from "../../queries/society";
import { useToastStore } from "../../store/useToastStore";
import { useCloudinaryUpload } from "../../hooks/use-cloudinary-upload";
import { ScreenContainer } from "../ui/screen-container";
import { Card } from "../ui/card";
import { Loader } from "../ui/loader";
import { DateChips } from "../ui/date-chips";
import { FormInput } from "../ui/form-input";
import { NoticeCard, type Notice } from "./notices/notice-card";
import { createNoticeSchema, type CreateNoticeFormData } from "@/lib/form-schemas";

export function CreateNoticeView() {
  const { data: notices, isLoading: noticesLoading, refetch: refetchNotices } = useNoticesQuery();
  const noticeMutation = useCreateNoticeMutation();
  const deleteMutation = useDeleteNoticeMutation();
  const { showToast } = useToastStore();

  const [activeTab, setActiveTab] = useState<"create" | "manage">("create");
  const [banner, setBanner] = useState("");
  const [bannerPublicId, setBannerPublicId] = useState("");

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<CreateNoticeFormData>({
    resolver: zodResolver(createNoticeSchema),
    mode: "onTouched",
    defaultValues: {
      title: "",
      content: "",
      endDate: "",
    },
  });

  const { upload: uploadBanner, isUploading } = useCloudinaryUpload({
    folder: "notices",
    type: "public",
  });

  const handlePickBanner = async () => {
    const res = await uploadBanner();
    if (res?.url) {
      setBanner(res.url);
      setBannerPublicId(res.publicId);
      showToast("Notice banner uploaded successfully!", "success");
    }
  };

  const handleRemoveBanner = () => {
    setBanner("");
    setBannerPublicId("");
  };

  const onSubmit = async (data: CreateNoticeFormData) => {
    try {
      await noticeMutation.mutateAsync({
        title: data.title.trim(),
        content: data.content.trim(),
        banner: banner.trim() || null,
        bannerPublicId: bannerPublicId.trim() || null,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
      });
      showToast("Notice announcement published and broadcasted!", "success");
      reset({ title: "", content: "", endDate: "" });
      setBanner("");
      setBannerPublicId("");
      setActiveTab("manage");
      refetchNotices();
    } catch (err: any) {
      showToast(err.message || "Failed to publish notice", "error");
    }
  };

  const handleDelete = (noticeId: string) => {
    Alert.alert(
      "Delete Announcement",
      "Are you sure you want to delete this notice? This action is permanent.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(noticeId);
              showToast("Notice deleted successfully", "success");
              refetchNotices();
            } catch (err: any) {
              showToast("Failed to delete notice", "error");
            }
          },
        },
      ]
    );
  };

  if (noticesLoading) {
    return <Loader />;
  }

  const primaryColor = "#b45309";

  return (
    <ScreenContainer contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {/* Header */}
      <View className="mb-5 flex-row justify-between items-center">
        <View className="flex-1 pr-4">
          <Text className="text-foreground-light dark:text-foreground-dark text-xl font-bold">Announcements</Text>
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-1">
            Broadcast emergency alerts, schedules, and bulletins to all resident flats
          </Text>
        </View>
        <Ionicons name="megaphone-outline" size={24} color={primaryColor} />
      </View>

      {/* Tabs */}
      <View className="flex-row bg-muted-light dark:bg-muted-dark p-1 rounded-xl mb-6">
        <Pressable
          onPress={() => setActiveTab("create")}
          className={`flex-1 py-2.5 rounded-lg items-center ${activeTab === "create" ? "bg-card-light dark:bg-card-dark shadow-sm" : ""}`}
        >
          <Text className={`text-xs font-bold ${activeTab === "create" ? "text-primary-light dark:text-primary-dark" : "text-muted-foreground-light dark:text-muted-foreground-dark"}`}>
            New Notice
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("manage")}
          className={`flex-1 py-2.5 rounded-lg items-center ${activeTab === "manage" ? "bg-card-light dark:bg-card-dark shadow-sm" : ""}`}
        >
          <Text className={`text-xs font-bold ${activeTab === "manage" ? "text-primary-light dark:text-primary-dark" : "text-muted-foreground-light dark:text-muted-foreground-dark"}`}>
            Manage Notices
          </Text>
        </Pressable>
      </View>

      {activeTab === "create" ? (
        <Card className="p-5 gap-4">
          {/* Banner Photo */}
          <View className="gap-2.5">
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs font-bold uppercase tracking-wider">
              Optional Banner Image
            </Text>
            {isUploading ? (
              <View className="flex-row items-center justify-center p-3 gap-2">
                <ActivityIndicator color={primaryColor} size="small" />
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs font-bold">Uploading banner...</Text>
              </View>
            ) : banner ? (
              <View className="relative w-full h-28 rounded-xl overflow-hidden border border-border-light dark:border-border-dark">
                <Image source={{ uri: banner }} className="w-full h-full" />
                <Pressable
                  onPress={handleRemoveBanner}
                  className="absolute top-2 right-2 bg-black/60 rounded-full p-1.5 active:scale-95"
                >
                  <Ionicons name="trash-outline" size={14} color="#ef4444" />
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={handlePickBanner}
                className="border border-dashed border-border-light dark:border-border-dark py-4 rounded-xl justify-center items-center flex-row gap-2 active:bg-muted-light/40 dark:active:bg-muted-dark/40"
              >
                <Ionicons name="image-outline" size={16} color={primaryColor} />
                <Text className="text-foreground-light dark:text-foreground-dark text-xs font-bold">Upload banner photo</Text>
              </Pressable>
            )}
          </View>

          {/* Title */}
          <FormInput
            control={control}
            name="title"
            label="Notice Title *"
            placeholder="e.g. Water Supply Maintenance Shutdown"
          />

          {/* Content */}
          <FormInput
            control={control}
            name="content"
            label="Notice Body Content *"
            placeholder="Announce details to all residents..."
            multiline
            numberOfLines={4}
            className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl py-3 px-4 focus:border-primary-light dark:focus:border-primary-dark text-xs font-semibold min-h-[80px]"
          />

          {/* End Date */}
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
        </Card>
      ) : (
        <View className="gap-4">
          <Text className="text-foreground-light dark:text-foreground-dark text-lg font-bold">
            Published Announcements
          </Text>

          {!notices || notices.length === 0 ? (
            <Card className="py-12 items-center justify-center border border-border-light dark:border-border-dark">
              <Ionicons name="notifications-off-outline" size={32} color="#78716c" />
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-2.5 font-medium">
                No active announcements published.
              </Text>
            </Card>
          ) : (
            <View className="gap-1">
              {notices.map((not: any) => (
                <NoticeCard
                  key={not.id}
                  notice={not as Notice}
                  onDelete={() => handleDelete(not.id)}
                  primaryColor={primaryColor}
                />
              ))}
            </View>
          )}
        </View>
      )}
    </ScreenContainer>
  );
}

export default CreateNoticeView;
