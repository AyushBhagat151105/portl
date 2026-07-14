import React, { useState } from "react";
import { Text, View, Pressable, Alert, ActivityIndicator, TextInput } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Ionicons } from "@expo/vector-icons";
import { useStaffQuery, useCreateStaffMutation, useDeleteStaffMutation } from "@/queries/society";

const STAFF_ROLES = ["MAID", "DRIVER", "PLUMBER", "COOK", "ELECTRICIAN", "GARDENER", "SECURITY", "OTHER"];

type StaffMember = {
  id: string;
  name: string;
  phone: string;
  role: string;
  status: string;
  code?: string;
};

export function ManageStaffView() {
  const { data: staff = [], isLoading } = useStaffQuery();
  const createMutation = useCreateStaffMutation();
  const deleteMutation = useDeleteStaffMutation();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("MAID");
  const [code, setCode] = useState("");

  const handleCreate = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert("Error", "Name and phone are required");
      return;
    }
    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        phone: phone.trim(),
        role,
        code: code.trim() || undefined,
      });
      Alert.alert("Success", `${name} has been added to the directory`);
      setName("");
      setPhone("");
      setRole("MAID");
      setCode("");
      setShowForm(false);
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || err?.message || "Failed to add staff");
    }
  };

  const handleDelete = (staffMember: StaffMember) => {
    Alert.alert(
      "Remove Staff",
      `Remove ${staffMember.name} from the directory?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(staffMember.id);
            } catch (err: any) {
              Alert.alert("Error", err?.message || "Failed to remove staff");
            }
          },
        },
      ]
    );
  };

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

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-zinc-950"
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-5">
        <View>
          <Text className="text-white text-xl font-bold">Staff Directory</Text>
          <Text className="text-zinc-500 text-xs mt-1">{(staff as StaffMember[]).length} staff providers</Text>
        </View>
        <Pressable
          onPress={() => setShowForm((v) => !v)}
          className="bg-amber-500 rounded-xl px-4 py-2.5 flex-row items-center gap-2"
        >
          <Ionicons name={showForm ? "close" : "add"} size={16} color="#000" />
          <Text className="text-black font-bold text-xs">{showForm ? "Cancel" : "Add Staff"}</Text>
        </Pressable>
      </View>

      {/* Create Form */}
      {showForm && (
        <View className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 mb-5 gap-4">
          <Text className="text-white font-semibold text-sm mb-1">New Staff Provider</Text>

          <View className="gap-1.5">
            <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Name *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Full name"
              placeholderTextColor="#52525b"
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm"
            />
          </View>

          <View className="gap-1.5">
            <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Phone *</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="+91 XXXXX XXXXX"
              placeholderTextColor="#52525b"
              keyboardType="phone-pad"
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm"
            />
          </View>

          <View className="gap-1.5">
            <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Role *</Text>
            <View className="flex-row flex-wrap gap-2">
              {STAFF_ROLES.map((r) => (
                <Pressable
                  key={r}
                  onPress={() => setRole(r)}
                  className="px-3 py-1.5 rounded-lg border"
                  style={{
                    backgroundColor: role === r ? `${roleColors[r]}18` : "#09090b",
                    borderColor: role === r ? roleColors[r] : "#3f3f46",
                  }}
                >
                  <Text
                    className="text-xs font-semibold capitalize"
                    style={{ color: role === r ? roleColors[r] : "#71717a" }}
                  >
                    {r.charAt(0) + r.slice(1).toLowerCase()}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View className="gap-1.5">
            <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Badge / Code (optional)</Text>
            <TextInput
              value={code}
              onChangeText={setCode}
              placeholder="ID card or badge number"
              placeholderTextColor="#52525b"
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm font-mono"
            />
          </View>

          <Pressable
            onPress={handleCreate}
            disabled={createMutation.isPending}
            className="bg-amber-500 rounded-xl py-3.5 items-center"
            style={{ opacity: createMutation.isPending ? 0.6 : 1 }}
          >
            {createMutation.isPending ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text className="text-black font-bold text-sm">Add Staff Provider</Text>
            )}
          </Pressable>
        </View>
      )}

      {/* Staff list */}
      {isLoading ? (
        <View className="items-center py-12">
          <ActivityIndicator size="large" color="#f59e0b" />
        </View>
      ) : (staff as StaffMember[]).length === 0 ? (
        <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 items-center">
          <Ionicons name="person-outline" size={40} color="#3f3f46" />
          <Text className="text-zinc-500 text-sm mt-3">No staff providers added</Text>
          <Text className="text-zinc-600 text-xs mt-1 text-center">Add maids, drivers, and other service staff to the directory</Text>
        </View>
      ) : (
        <View className="gap-3">
          {(staff as StaffMember[]).map((member) => {
            const color = roleColors[member.role.toUpperCase()] || "#6b7280";
            return (
              <View key={member.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex-row items-center gap-3">
                <View
                  className="w-11 h-11 rounded-xl items-center justify-center"
                  style={{ backgroundColor: `${color}18`, borderColor: `${color}40`, borderWidth: 1 }}
                >
                  <Text className="font-bold text-base" style={{ color }}>
                    {member.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-white font-semibold text-sm">{member.name}</Text>
                  <Text className="text-zinc-500 text-xs mt-0.5">{member.phone}</Text>
                  <View className="flex-row items-center gap-2 mt-1.5">
                    <View
                      className="px-2 py-0.5 rounded-md"
                      style={{ backgroundColor: `${color}18` }}
                    >
                      <Text className="text-xs font-semibold" style={{ color }}>
                        {member.role.charAt(0) + member.role.slice(1).toLowerCase()}
                      </Text>
                    </View>
                    {member.code && (
                      <Text className="text-zinc-600 text-xs font-mono">#{member.code}</Text>
                    )}
                  </View>
                </View>
                <Pressable
                  onPress={() => handleDelete(member)}
                  className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 items-center justify-center"
                >
                  <Ionicons name="trash-outline" size={15} color="#f43f5e" />
                </Pressable>
              </View>
            );
          })}
        </View>
      )}
    </KeyboardAwareScrollView>
  );
}
