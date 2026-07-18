import React, { useState, useEffect } from "react";
import { View, Text, Pressable, TextInput, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormModal } from "../../ui/form-modal";
import { allocateFlatSchema, type AllocateFlatFormData } from "../../../lib/form-schemas";
import { type Member } from "./resident-card";

interface FlatAllocationModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: AllocateFlatFormData) => Promise<void>;
  isSubmitting: boolean;
  defaultValues: {
    flatId: string;
    occupancyStatus: "VACANT" | "OWNER_OCCUPIED" | "RENTED";
    ownerId: string | null;
    memberCount: string;
    vehicleMemberCount: string;
    residentIds: string[];
  } | null;
  residents: Member[];
}

export function FlatAllocationModal({
  visible,
  onClose,
  onSubmit,
  isSubmitting,
  defaultValues,
  residents,
}: FlatAllocationModalProps) {
  const [residentSearch, setResidentSearch] = useState("");

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
  } = useForm<AllocateFlatFormData>({
    resolver: zodResolver(allocateFlatSchema),
    defaultValues: {
      occupancyStatus: "VACANT",
      ownerId: null,
      memberCount: "0",
      vehicleMemberCount: "0",
      residentIds: [],
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        occupancyStatus: defaultValues.occupancyStatus || "VACANT",
        ownerId: defaultValues.ownerId,
        memberCount: String(defaultValues.memberCount),
        vehicleMemberCount: String(defaultValues.vehicleMemberCount),
        residentIds: defaultValues.residentIds || [],
      });
    }
  }, [defaultValues, reset, visible]);

  const occupancyStatus = watch("occupancyStatus");
  const ownerId = watch("ownerId");
  const residentIds = watch("residentIds") || [];

  // Filter residents list by search query
  const filteredResidents = residents.filter((r) =>
    r.user.name.toLowerCase().includes(residentSearch.toLowerCase()) ||
    r.user.email.toLowerCase().includes(residentSearch.toLowerCase())
  );

  const toggleFlatResident = (userId: string) => {
    if (residentIds.includes(userId)) {
      setValue("residentIds", residentIds.filter((id) => id !== userId));
    } else {
      setValue("residentIds", [...residentIds, userId]);
    }
  };

  return (
    <FormModal
      visible={visible}
      onClose={onClose}
      title="Flat Configuration"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitLabel="Save Flat Setup"
      maxHeight={480}
    >
      {/* Occupancy selection */}
      <View className="gap-1.5">
        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">
          Occupancy Status
        </Text>
        <View className="flex-row gap-1.5">
          {(["VACANT", "OWNER_OCCUPIED", "RENTED"] as const).map((status) => {
            const isSelected = occupancyStatus === status;
            return (
              <Pressable
                key={status}
                onPress={() => setValue("occupancyStatus", status)}
                className={`flex-1 py-2 rounded-lg border items-center ${
                  isSelected
                    ? "bg-primary-light/10 dark:bg-primary-dark/10 border-primary-light dark:border-primary-dark"
                    : "bg-muted-light dark:bg-muted-dark border-border-light dark:border-border-dark"
                }`}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
              >
                <Text className={`text-[10px] font-bold ${isSelected ? "text-primary-light dark:text-primary-dark" : "text-muted-foreground-light dark:text-muted-foreground-dark"}`}>
                  {status}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Resident List Search Filter (Solves the scalability problem!) */}
      <View className="gap-1.5 mt-2">
        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">
          Search Residents to Assign
        </Text>
        <TextInput
          value={residentSearch}
          onChangeText={setResidentSearch}
          placeholder="Type name or email to filter list..."
          placeholderTextColor="#78716c"
          className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-3 py-2 text-xs"
        />
      </View>

      {/* Owner assignee */}
      <View className="gap-1.5 mt-2">
        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">
          Select Flat Owner
        </Text>
        <View className="flex-row flex-wrap gap-1.5 max-h-[100px] overflow-scroll">
          <Pressable
            onPress={() => setValue("ownerId", null)}
            className={`px-2.5 py-1.5 rounded-lg border ${
              ownerId === null
                ? "bg-primary-light/10 dark:bg-primary-dark/10 border-primary-light dark:border-primary-dark"
                : "bg-muted-light dark:bg-muted-dark border-border-light dark:border-border-dark"
            }`}
            accessibilityRole="button"
            accessibilityState={{ selected: ownerId === null }}
          >
            <Text className={`text-xxs ${ownerId === null ? "text-primary-light dark:text-primary-dark font-bold" : "text-muted-foreground-light dark:text-muted-foreground-dark"}`}>
              No Owner
            </Text>
          </Pressable>
          {filteredResidents.map((r) => {
            const isOwner = ownerId === r.user.id;
            return (
              <Pressable
                key={r.user.id}
                onPress={() => setValue("ownerId", r.user.id)}
                className={`px-2.5 py-1.5 rounded-lg border ${
                  isOwner
                    ? "bg-primary-light/10 dark:bg-primary-dark/10 border-primary-light dark:border-primary-dark"
                    : "bg-muted-light dark:bg-muted-dark border-border-light dark:border-border-dark"
                }`}
                accessibilityRole="button"
                accessibilityState={{ selected: isOwner }}
              >
                <Text className={`text-xxs ${isOwner ? "text-primary-light dark:text-primary-dark font-bold" : "text-muted-foreground-light dark:text-muted-foreground-dark"}`}>
                  {r.user.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Resident(s) assignee (Tenants / Occupants) */}
      <View className="gap-1.5 mt-2">
        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">
          Select Occupying Residents (Tenants)
        </Text>
        <View className="flex-row flex-wrap gap-1.5 max-h-[120px] overflow-scroll">
          {filteredResidents.map((r) => {
            const isResSelected = residentIds.includes(r.user.id);
            return (
              <Pressable
                key={r.user.id}
                onPress={() => toggleFlatResident(r.user.id)}
                className={`px-2.5 py-1.5 rounded-lg border ${
                  isResSelected
                    ? "bg-primary-light/10 dark:bg-primary-dark/10 border-primary-light dark:border-primary-dark"
                    : "bg-muted-light dark:bg-muted-dark border-border-light dark:border-border-dark"
                }`}
                accessibilityRole="button"
                accessibilityState={{ selected: isResSelected }}
              >
                <Text className={`text-xxs ${isResSelected ? "text-primary-light dark:text-primary-dark font-bold" : "text-muted-foreground-light dark:text-muted-foreground-dark"}`}>
                  {r.user.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* memberCount and vehicleMemberCount fields */}
      <View className="flex-row gap-3 mt-2">
        <View className="flex-1 gap-1">
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">
            Total Residents
          </Text>
          <Controller
            control={control}
            name="memberCount"
            render={({ field }) => (
              <TextInput
                value={field.value}
                onChangeText={(val) => field.onChange(val.replace(/\D/g, ""))}
                keyboardType="numeric"
                className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-3 py-2 text-xs font-mono"
              />
            )}
          />
        </View>
        <View className="flex-1 gap-1">
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs font-semibold uppercase tracking-wider">
            Vehicle Users
          </Text>
          <Controller
            control={control}
            name="vehicleMemberCount"
            render={({ field }) => (
              <TextInput
                value={field.value}
                onChangeText={(val) => field.onChange(val.replace(/\D/g, ""))}
                keyboardType="numeric"
                className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-3 py-2 text-xs font-mono"
              />
            )}
          />
        </View>
      </View>
    </FormModal>
  );
}
export default FlatAllocationModal;
