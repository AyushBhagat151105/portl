import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, Image, Modal } from "react-native";
import { Chip } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { useComplaintsQuery, useUpdateComplaintMutation } from "../../queries/society";
import { useToastStore } from "../../store/useToastStore";
import { ScreenContainer } from "../ui/screen-container";
import { Card } from "../ui/card";
import { Loader } from "../ui/loader";

export function ManageTicketsView() {
  const { data: tickets, isLoading: ticketsLoading } = useComplaintsQuery();
  const updateMutation = useUpdateComplaintMutation();
  const { showToast } = useToastStore();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleUpdateStatus = async (complaintId: string, status: "PENDING" | "IN_PROGRESS" | "RESOLVED") => {
    try {
      await updateMutation.mutateAsync({ complaintId, status });
      showToast(`Ticket status updated to ${status.replace("_", " ").toLowerCase()}!`, "success");
    } catch (err: any) {
      showToast(err.message || "Failed to update ticket status", "error");
    }
  };

  if (ticketsLoading) {
    return <Loader />;
  }

  return (
    <ScreenContainer contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
      <Text className="text-foreground-light dark:text-foreground-dark text-xl font-bold mb-4">
        Society Support Tickets
      </Text>

      {!tickets || tickets.length === 0 ? (
        <Card className="items-center p-6">
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-sm">
            No complaints logged yet.
          </Text>
        </Card>
      ) : (
        tickets.map((comp: any) => (
          <Card key={comp.id} className="mb-4">
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1 pr-2">
                <Text className="text-foreground-light dark:text-foreground-dark text-base font-bold">
                  {comp.title}
                </Text>
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-1">
                  {comp.description}
                </Text>
              </View>
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

            {comp.images && comp.images.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 mt-2 mb-1">
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

            <View className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark p-2.5 rounded-xl flex-row justify-between items-center my-3.5">
              <View>
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs uppercase tracking-wider font-semibold">
                  Raised By
                </Text>
                <Text className="text-foreground-light dark:text-foreground-dark text-xs mt-0.5">
                  {comp.raisedBy?.name || "Resident"}
                </Text>
              </View>
              {comp.flat && (
                <View className="items-end">
                  <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs uppercase tracking-wider font-semibold">
                    Target Flat
                  </Text>
                  <Text className="text-foreground-light dark:text-foreground-dark text-xs mt-0.5">
                    {comp.flat.tower.name} - {comp.flat.number}
                  </Text>
                </View>
              )}
            </View>

            {/* Admin status updates */}
            <View className="flex-row gap-2 mt-1">
              <Pressable
                disabled={comp.status === "IN_PROGRESS" || updateMutation.isPending}
                onPress={() => handleUpdateStatus(comp.id, "IN_PROGRESS")}
                className="flex-1 bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark rounded-xl py-2.5 items-center active:opacity-75"
              >
                <Text className="text-primary-light dark:text-primary-dark font-semibold text-xs">Set In Progress</Text>
              </Pressable>
              <Pressable
                disabled={comp.status === "RESOLVED" || updateMutation.isPending}
                onPress={() => handleUpdateStatus(comp.id, "RESOLVED")}
                className="flex-1 bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark rounded-xl py-2.5 items-center active:opacity-75"
              >
                <Text className="text-emerald-500 font-semibold text-xs">Mark Resolved</Text>
              </Pressable>
            </View>
          </Card>
        ))
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
export default ManageTicketsView;
