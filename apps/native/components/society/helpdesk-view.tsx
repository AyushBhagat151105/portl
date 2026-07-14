import React, { useState } from "react";
import { Text, View, Pressable, TextInput, Alert, ActivityIndicator } from "react-native";
import { Card, Chip } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useComplaintsQuery, useRaiseComplaintMutation, useMyFlatsQuery } from "../../queries/society";

export function HelpdeskView() {
  const { data: complaints, isLoading: complaintsLoading } = useComplaintsQuery();
  const raiseComplaintMutation = useRaiseComplaintMutation();
  const { data: flats } = useMyFlatsQuery();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"PLUMBING" | "ELECTRICAL" | "SECURITY" | "CLEANLINESS" | "OTHERS">("PLUMBING");
  const [flatId, setFlatId] = useState("");
  const [isRaising, setIsRaising] = useState(false);

  React.useEffect(() => {
    if (flats && flats.length > 0 && !flatId) {
      setFlatId(flats[0].id);
    }
  }, [flats]);

  const handleRaiseComplaint = async () => {
    if (!title || !description || !flatId) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      await raiseComplaintMutation.mutateAsync({
        title,
        description,
        category,
        flatId,
      });
      setTitle("");
      setDescription("");
      setIsRaising(false);
      Alert.alert("Success", "Complaint ticket registered successfully");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to raise ticket");
    }
  };

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-zinc-950 px-6 py-4"
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      {isRaising ? (
        <View className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-xl font-bold">Raise New Complaint</Text>
            <Pressable onPress={() => setIsRaising(false)}>
              <Ionicons name="close-circle-outline" size={24} color="#a1a1aa" />
            </Pressable>
          </View>

          <View className="gap-4">
            <View>
              <Text className="text-zinc-400 text-xs mb-1.5">Category</Text>
              <View className="flex-row flex-wrap gap-2">
                {(["PLUMBING", "ELECTRICAL", "SECURITY", "CLEANLINESS", "OTHERS"] as const).map((cat) => (
                  <Pressable
                    key={cat}
                    onPress={() => setCategory(cat)}
                    className="py-2 px-3 rounded-lg border"
                    style={{
                      backgroundColor: category === cat ? "rgba(245, 158, 11, 0.1)" : "#09090b",
                      borderColor: category === cat ? "#f59e0b" : "#27272a",
                    }}
                  >
                    <Text
                      className="text-xs"
                      style={{
                        color: category === cat ? "#f59e0b" : "#a1a1aa",
                        fontWeight: category === cat ? "600" : "400",
                      }}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View>
              <Text className="text-zinc-400 text-xs mb-1.5">Issue Title *</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Lift not working"
                placeholderTextColor="#52525b"
                className="bg-zinc-950 text-white rounded-xl py-3 px-4 border border-zinc-800"
              />
            </View>

            <View>
              <Text className="text-zinc-400 text-xs mb-1.5">Details / Description *</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Describe the issue in detail"
                placeholderTextColor="#52525b"
                multiline
                numberOfLines={3}
                className="bg-zinc-950 text-white rounded-xl py-3 px-4 border border-zinc-800 h-24 text-align-vertical-top"
              />
            </View>

            <Pressable
              disabled={raiseComplaintMutation.isPending}
              onPress={handleRaiseComplaint}
              className="bg-amber-600 rounded-xl py-3.5 mt-2 items-center justify-center active:opacity-80"
            >
              {raiseComplaintMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base">Submit Complaint</Text>
              )}
            </Pressable>
          </View>
        </View>
      ) : (
        <View>
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-white text-xl font-bold">Helpdesk Tickets</Text>
            <Pressable
              onPress={() => setIsRaising(true)}
              className="bg-amber-600/10 border border-amber-500/30 px-3 py-1.5 rounded-lg active:opacity-80"
            >
              <Text className="text-amber-500 text-xs font-semibold">+ Raise Issue</Text>
            </Pressable>
          </View>

          {complaintsLoading ? (
            <ActivityIndicator size="small" color="#f59e0b" className="my-6" />
          ) : !complaints || complaints.length === 0 ? (
            <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 items-center">
              <Text className="text-zinc-500 text-sm">No complaints logged yet.</Text>
            </View>
          ) : (
            complaints.map((comp: any) => (
              <Card key={comp.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-3">
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1 pr-2">
                    <Text className="text-white text-base font-bold">{comp.title}</Text>
                    <Text className="text-zinc-400 text-xs mt-1">{comp.description}</Text>
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

                <View className="flex-row justify-between items-center border-t border-zinc-800/80 pt-2.5 mt-2">
                  <Text className="text-zinc-500 text-xxs">Category: {comp.category}</Text>
                  {comp.flat && (
                    <Text className="text-zinc-500 text-xxs">
                      Flat: {comp.flat.tower.name} - {comp.flat.number}
                    </Text>
                  )}
                </View>
              </Card>
            ))
          )}
        </View>
      )}
    </KeyboardAwareScrollView>
  );
}

