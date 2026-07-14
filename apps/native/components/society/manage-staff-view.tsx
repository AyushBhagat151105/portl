import React from "react";
import { Text, View, Pressable, Alert, ActivityIndicator, TextInput, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldError } from "heroui-native";
import { useStaffQuery, useCreateStaffMutation, useDeleteStaffMutation } from "@/queries/society";
import { useToastStore } from "@/store/useToastStore";
import { ScreenContainer } from "../ui/screen-container";
import { Card } from "../ui/card";
import { Loader } from "../ui/loader";
import { createStaffSchema, type CreateStaffFormData } from "@/lib/form-schemas";

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
  const { showToast } = useToastStore();
  const colorScheme = useColorScheme();

  const [showForm, setShowForm] = React.useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<CreateStaffFormData>({
    resolver: zodResolver(createStaffSchema),
    mode: "onTouched",
    defaultValues: { name: "", phone: "", role: "MAID", code: "" },
  });

  const onSubmit = async (data: CreateStaffFormData) => {
    try {
      await createMutation.mutateAsync({
        name: data.name.trim(),
        phone: data.phone.trim(),
        role: data.role,
        code: data.code?.trim() || undefined,
      });
      showToast(`${data.name} has been added successfully!`, "success");
      reset({ name: "", phone: "", role: "MAID", code: "" });
      setShowForm(false);
    } catch (err: any) {
      showToast(err.message || "Failed to add staff", "error");
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
              showToast(`${staffMember.name} removed from directory`, "success");
            } catch (err: any) {
              showToast(err.message || "Failed to remove staff", "error");
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
    <ScreenContainer contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-5">
        <View>
          <Text className="text-foreground-light dark:text-foreground-dark text-xl font-bold">Staff Directory</Text>
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-1">
            {(staff as StaffMember[]).length} staff providers
          </Text>
        </View>
        <Pressable
          onPress={() => setShowForm((v) => !v)}
          className="bg-primary-light dark:bg-primary-dark rounded-xl px-4 py-2.5 flex-row items-center gap-2 active:opacity-90"
        >
          <Ionicons name={showForm ? "close" : "add"} size={16} color="#ffffff" />
          <Text className="text-white font-bold text-xs">{showForm ? "Cancel" : "Add Staff"}</Text>
        </Pressable>
      </View>

      {/* Create Form */}
      {showForm && (
        <Card className="mb-5 gap-4">
          <Text className="text-foreground-light dark:text-foreground-dark font-semibold text-sm mb-1">
            New Staff Provider
          </Text>

          <View className="gap-1.5">
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs font-semibold uppercase tracking-wider">
              Name *
            </Text>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <TextInput
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="Full name"
                  placeholderTextColor="#78716c"
                  className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-4 py-3 text-sm focus:border-primary-light dark:focus:border-primary-dark"
                />
              )}
            />
            {errors.name && (
              <FieldError isInvalid className="text-rose-500 text-xs">{errors.name.message}</FieldError>
            )}
          </View>

          <View className="gap-1.5">
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs font-semibold uppercase tracking-wider">
              Phone *
            </Text>
            <Controller
              control={control}
              name="phone"
              render={({ field }) => (
                <TextInput
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="+91 XXXXX XXXXX"
                  placeholderTextColor="#78716c"
                  keyboardType="phone-pad"
                  className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-4 py-3 text-sm focus:border-primary-light dark:focus:border-primary-dark"
                />
              )}
            />
            {errors.phone && (
              <FieldError isInvalid className="text-rose-500 text-xs">{errors.phone.message}</FieldError>
            )}
          </View>

          <View className="gap-1.5">
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs font-semibold uppercase tracking-wider">
              Role *
            </Text>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <View className="flex-row flex-wrap gap-2">
                  {STAFF_ROLES.map((r) => (
                    <Pressable
                      key={r}
                      onPress={() => field.onChange(r)}
                      className={`px-3 py-1.5 rounded-lg border ${
                        field.value === r
                          ? "bg-primary-light/10 dark:bg-primary-dark/10"
                          : "bg-muted-light dark:bg-muted-dark"
                      }`}
                      style={{
                        borderColor: field.value === r ? roleColors[r] : (colorScheme === "dark" ? "#44403c" : "#e4d9bc"),
                      }}
                    >
                      <Text
                        className="text-xs font-semibold capitalize"
                        style={{ color: field.value === r ? roleColors[r] : "#78716c" }}
                      >
                        {r.charAt(0) + r.slice(1).toLowerCase()}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            />
            {errors.role && (
              <FieldError isInvalid className="text-rose-500 text-xs">{errors.role.message}</FieldError>
            )}
          </View>

          <View className="gap-1.5">
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs font-semibold uppercase tracking-wider">
              Badge / Code (optional)
            </Text>
            <Controller
              control={control}
              name="code"
              render={({ field }) => (
                <TextInput
                  value={field.value ?? ""}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="ID card or badge number"
                  placeholderTextColor="#78716c"
                  className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-4 py-3 text-sm font-mono focus:border-primary-light dark:focus:border-primary-dark"
                />
              )}
            />
          </View>

          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={createMutation.isPending}
            className="bg-primary-light dark:bg-primary-dark active:opacity-90 disabled:opacity-50 rounded-xl py-3.5 items-center flex-row justify-center gap-2"
          >
            {createMutation.isPending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white font-bold text-sm">Add Staff Provider</Text>
            )}
          </Pressable>
        </Card>
      )}

      {/* Staff list */}
      {isLoading ? (
        <Loader fullscreen={false} />
      ) : (staff as StaffMember[]).length === 0 ? (
        <Card className="p-10 items-center">
          <Ionicons name="person-outline" size={40} color="#78716c" />
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-sm mt-3">
            No staff providers added
          </Text>
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-1 text-center">
            Add maids, drivers, and other service staff to the directory
          </Text>
        </Card>
      ) : (
        <View className="gap-3">
          {(staff as StaffMember[]).map((member) => {
            const color = roleColors[member.role.toUpperCase()] || "#6b7280";
            return (
              <Card key={member.id} className="flex-row items-center gap-3">
                <View
                  className="w-11 h-11 rounded-xl items-center justify-center border"
                  style={{ backgroundColor: `${color}18`, borderColor: `${color}40` }}
                >
                  <Text className="font-bold text-base" style={{ color }}>
                    {member.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-foreground-light dark:text-foreground-dark font-semibold text-sm">
                    {member.name}
                  </Text>
                  <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-0.5">
                    {member.phone}
                  </Text>
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
                      <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs font-mono">
                        #{member.code}
                      </Text>
                    )}
                  </View>
                </View>
                <Pressable
                  onPress={() => handleDelete(member)}
                  className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 items-center justify-center active:opacity-75"
                >
                  <Ionicons name="trash-outline" size={15} color="#f43f5e" />
                </Pressable>
              </Card>
            );
          })}
        </View>
      )}
    </ScreenContainer>
  );
}
export default ManageStaffView;
