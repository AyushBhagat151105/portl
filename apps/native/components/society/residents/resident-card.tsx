import React, { useState } from "react";
import { View, Text, Pressable, Image, ActivityIndicator, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../../lib/api";
import { useToastStore } from "../../../store/useToastStore";

export type Vehicle = {
  id: string;
  plateNumber: string;
  makeModel?: string | null;
  type: string;
};

export type Member = {
  id: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    aadharNumber?: string | null;
    aadharPublicId?: string | null;
    vehicleNumber?: string | null;
    vehicles?: Vehicle[];
    flats: {
      id: string;
      number: string;
      occupancyStatus: string;
      memberCount: number;
      vehicleMemberCount: number;
      tower: { name: string };
    }[];
  };
};

interface ResidentCardProps {
  member: Member;
  isSelected: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  primaryColor: string;
}

export function ResidentCard({
  member,
  isSelected,
  onToggle,
  onEdit,
  onDelete,
  primaryColor,
}: ResidentCardProps) {
  const currentFlats = member.user.flats;
  const vehicles = member.user.vehicles || [];
  const { showToast } = useToastStore();
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);

  const handleViewAadhar = async () => {
    if (!member.user.aadharPublicId) return;
    setIsFetchingUrl(true);
    try {
      const res = await api.get(`/api/society/admin/residents/${member.user.id}/aadhar-url`);
      const url = res.data?.data?.url;
      if (url) {
        await Linking.openURL(url);
      } else {
        showToast("Failed to retrieve document link", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Could not retrieve document link", "error");
    } finally {
      setIsFetchingUrl(false);
    }
  };

  return (
    <View className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl overflow-hidden mb-3">
      {/* Tap header */}
      <Pressable
        onPress={onToggle}
        className="p-4 flex-row items-center gap-3 active:opacity-95"
        accessibilityRole="button"
        accessibilityLabel={`Toggle resident ${member.user.name} details`}
      >
        <View className="w-11 h-11 rounded-full overflow-hidden bg-primary-light/10 dark:bg-primary-dark/10 items-center justify-center border border-primary-light/20">
          {member.user.image ? (
            <Image source={{ uri: member.user.image }} className="w-full h-full" />
          ) : (
            <Text className="text-primary-light dark:text-primary-dark font-extrabold text-sm">
              {member.user.name.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>

        <View className="flex-1">
          <Text className="text-foreground-light dark:text-foreground-dark font-extrabold text-sm leading-snug">
            {member.user.name}
          </Text>
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs font-semibold">
            {member.user.email}
          </Text>

          {currentFlats.length > 0 ? (
            <View className="flex-row flex-wrap gap-1 mt-1.5">
              {currentFlats.map((f) => (
                <View key={f.id} className="bg-primary-light/5 dark:bg-primary-dark/5 border border-primary-light/20 dark:border-primary-dark/20 rounded-md px-2 py-0.5">
                  <Text className="text-primary-light dark:text-primary-dark text-[9px] font-bold font-mono">
                    {f.tower.name} — {f.number} ({f.occupancyStatus})
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-[10px] mt-1.5 italic font-medium">
              No flat occupied
            </Text>
          )}
        </View>

        <Ionicons
          name={isSelected ? "chevron-up" : "chevron-down"}
          size={16}
          color="#78716c"
        />
      </Pressable>

      {/* Expanded Profile Details */}
      {isSelected && (
        <View className="border-t border-border-light/60 dark:border-border-dark/60 p-4 bg-muted-light/10 dark:bg-muted-dark/10 gap-4">
          {/* Profile overview */}
          <View className="flex-row gap-4 items-start">
            <View className="w-16 h-16 rounded-2xl overflow-hidden border border-border-light dark:border-border-dark bg-muted-light dark:bg-muted-dark justify-center items-center">
              {member.user.image ? (
                <Image source={{ uri: member.user.image }} className="w-full h-full" />
              ) : (
                <Ionicons name="person-outline" size={24} color="#78716c" />
              )}
            </View>
            <View className="flex-1 gap-1">
              <Text className="text-foreground-light dark:text-foreground-dark text-xs font-bold uppercase tracking-wider">
                Resident Details
              </Text>
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs font-semibold">
                Member ID: <Text className="font-mono text-foreground-light dark:text-white">{member.id.slice(0, 8)}</Text>
              </Text>
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs font-semibold">
                Joined: <Text className="text-foreground-light dark:text-white">{new Date(member.user.id ? parseInt(member.user.id.substring(0, 8), 16) * 1000 || Date.now() : Date.now()).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}</Text>
              </Text>
            </View>
          </View>

          {/* Verification & Documents */}
          <View className="bg-muted-light/20 dark:bg-muted-dark/20 p-3.5 rounded-2xl border border-border-light dark:border-border-dark gap-2">
            <Text className="text-foreground-light dark:text-foreground-dark text-xs font-bold uppercase tracking-wider">
              Verification Documents
            </Text>
            <View className="flex-row justify-between items-center mt-1">
              <View className="gap-0.5">
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-[11px] font-semibold">
                  Aadhar Number: {member.user.aadharNumber ? member.user.aadharNumber : "Not Provided"}
                </Text>
                {member.user.aadharPublicId ? (
                  <View className="flex-row items-center gap-1.5 mt-1">
                    <Ionicons name="shield-checkmark" size={12} color="#10b981" />
                    <Text className="text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold uppercase">Secured scan attached</Text>
                  </View>
                ) : (
                  <View className="flex-row items-center gap-1.5 mt-1">
                    <Ionicons name="alert-circle-outline" size={12} color="#78716c" />
                    <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-[10px] font-semibold uppercase">No document upload</Text>
                  </View>
                )}
              </View>

              {member.user.aadharPublicId && (
                <Pressable
                  disabled={isFetchingUrl}
                  onPress={handleViewAadhar}
                  className="bg-primary-light/10 dark:bg-primary-dark/10 border border-primary-light/20 dark:border-primary-dark/20 px-3 py-1.5 rounded-lg flex-row items-center gap-1 active:scale-95 disabled:opacity-50"
                  accessibilityRole="button"
                  accessibilityLabel="View attached Aadhar card document scan"
                >
                  {isFetchingUrl ? (
                    <ActivityIndicator size="small" color={primaryColor} />
                  ) : (
                    <>
                      <Ionicons name="eye-outline" size={13} color={primaryColor} />
                      <Text className="text-primary-light dark:text-primary-dark text-[10px] font-bold">View Doc</Text>
                    </>
                  )}
                </Pressable>
              )}
            </View>
          </View>

          {/* Vehicles list */}
          <View className="bg-muted-light/20 dark:bg-muted-dark/20 p-3.5 rounded-2xl border border-border-light dark:border-border-dark gap-2.5">
            <Text className="text-foreground-light dark:text-foreground-dark text-xs font-bold uppercase tracking-wider">
              Registered Vehicles ({vehicles.length})
            </Text>
            {vehicles.length === 0 ? (
              <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs italic font-medium">
                No vehicles registered to this member profile.
              </Text>
            ) : (
              <View className="gap-2 mt-0.5">
                {vehicles.map((v) => (
                  <View key={v.id} className="flex-row justify-between items-center border-b border-border-light/40 dark:border-border-dark/40 pb-2 last:border-b-0 last:pb-0">
                    <View className="flex-row items-center gap-2">
                      <Ionicons name={v.type === "CAR" ? "car-sport-outline" : "bicycle-outline"} size={14} color="#78716c" />
                      <Text className="text-foreground-light dark:text-foreground-dark text-xs font-mono font-bold uppercase">
                        {v.plateNumber}
                      </Text>
                    </View>
                    {v.makeModel && (
                      <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-[11px] font-semibold">
                        {v.makeModel}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Action Row Buttons */}
          <View className="flex-row justify-end gap-2 border-t border-border-light/40 dark:border-border-dark/40 pt-3">
            <Pressable
              onPress={onEdit}
              className="bg-primary-light/10 dark:bg-primary-dark/10 border border-primary-light/20 dark:border-primary-dark/20 px-3.5 py-2.5 rounded-xl flex-row items-center gap-1.5 active:opacity-75"
              accessibilityRole="button"
              accessibilityLabel={`Edit profile details for ${member.user.name}`}
            >
              <Ionicons name="create-outline" size={14} color={primaryColor} />
              <Text className="text-primary-light dark:text-primary-dark text-xs font-bold">Edit Profile</Text>
            </Pressable>
            <Pressable
              onPress={onDelete}
              className="bg-rose-500/10 border border-rose-500/25 px-3.5 py-2.5 rounded-xl flex-row items-center gap-1.5 active:opacity-75"
              accessibilityRole="button"
              accessibilityLabel={`Remove resident ${member.user.name}`}
            >
              <Ionicons name="trash-outline" size={14} color="#f43f5e" />
              <Text className="text-rose-500 text-xs font-bold">Remove</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
export default ResidentCard;
