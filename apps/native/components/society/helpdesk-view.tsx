import React, { useState, useCallback } from "react";
import { Text, View, Pressable, Image, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useComplaintsQuery, useRaiseComplaintMutation, useMyFlatsQuery } from "../../queries/society";
import { useToastStore } from "../../store/useToastStore";
import { ScreenContainer } from "../ui/screen-container";
import { Card } from "../ui/card";
import { Loader } from "../ui/loader";
import { RaiseComplaintForm } from "./helpdesk/raise-complaint-form";
import { ComplaintCard, type Complaint } from "./helpdesk/complaint-card";

export function HelpdeskView() {
  const { data: complaints, isLoading: complaintsLoading, refetch: refetchComplaints } = useComplaintsQuery();
  const raiseComplaintMutation = useRaiseComplaintMutation();
  const { data: flats, isLoading: flatsLoading, refetch: refetchFlats } = useMyFlatsQuery();
  const { showToast } = useToastStore();

  const [isRaising, setIsRaising] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchComplaints(), refetchFlats()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchComplaints, refetchFlats]);

  const handleRaiseSubmit = async (data: any) => {
    try {
      await raiseComplaintMutation.mutateAsync({
        title: data.title.trim(),
        description: data.description.trim(),
        category: data.category,
        flatId: data.flatId,
        images: data.images,
        imagePublicIds: data.imagePublicIds,
      });
      setIsRaising(false);
      showToast("Complaint ticket registered successfully!", "success");
      refetchComplaints();
    } catch (err: any) {
      showToast(err.message || "Failed to raise ticket", "error");
    }
  };

  if (complaintsLoading || flatsLoading) {
    return <Loader />;
  }

  // Association check fallback
  if (flats && flats.length === 0) {
    return (
      <ScreenContainer contentContainerStyle={{ padding: 24, justifyContent: "center", flexGrow: 1 }}>
        <Card className="p-8 items-center border border-amber-500/20 bg-amber-500/5">
          <Ionicons name="warning-outline" size={48} color="#d97706" style={{ marginBottom: 16 }} />
          <Text className="text-foreground-light dark:text-foreground-dark text-lg font-bold mb-2 text-center">
            No Flat Associated
          </Text>
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-sm text-center leading-relaxed">
            Your profile is not linked to any flat in this society yet. Please contact the society administrator to assign you to a flat.
          </Text>
        </Card>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
      onRefresh={handleRefresh}
      refreshing={refreshing}
    >
      {isRaising ? (
        /* Stateful Decomposed Raising Form */
        <RaiseComplaintForm
          onCancel={() => setIsRaising(false)}
          onSubmit={handleRaiseSubmit}
          isSubmitting={raiseComplaintMutation.isPending}
          flats={flats}
        />
      ) : (
        /* Complaints Listing */
        <View>
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-foreground-light dark:text-foreground-dark text-xl font-bold">
              Helpdesk Tickets
            </Text>
            <Pressable
              onPress={() => setIsRaising(true)}
              className="bg-primary-light/10 dark:bg-primary-dark/10 border border-primary-light/30 dark:border-primary-dark/30 px-3 py-1.5 rounded-lg active:opacity-85"
              accessibilityRole="button"
              accessibilityLabel="Raise new support ticket"
            >
              <Text className="text-primary-light dark:text-primary-dark text-xs font-semibold">+ Raise Issue</Text>
            </Pressable>
          </View>

          {!complaints || complaints.length === 0 ? (
            <Card className="p-6 items-center">
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-sm">
                No complaints logged yet.
              </Text>
            </Card>
          ) : (
            <View className="gap-1">
              {complaints.map((comp: any) => (
                <ComplaintCard
                  key={comp.id}
                  complaint={comp as Complaint}
                  onSelectImage={setSelectedImage}
                />
              ))}
            </View>
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
            accessibilityRole="button"
            accessibilityLabel="Close full screen image viewer"
          >
            <Ionicons name="close" size={24} color="white" />
          </Pressable>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

export default HelpdeskView;
