import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, ActivityIndicator, useColorScheme } from "react-native";
import { Chip } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { authClient } from "../../lib/auth-client";
import { env } from "@portl/env/native";
import {
  useResidentDuesQuery,
  useCreateRazorpayOrderMutation,
  useVerifyPaymentMutation,
  useMyFlatsQuery,
} from "../../queries/resident";
import { useToastStore } from "../../store/useToastStore";
import { ScreenContainer } from "../ui/screen-container";
import { Card, CardTitle, CardDescription } from "../ui/card";
import { Loader } from "../ui/loader";

export function ResidentDuesView() {
  const { data: dues, isLoading: duesLoading } = useResidentDuesQuery();
  const { data: flats, isLoading: flatsLoading } = useMyFlatsQuery();
  const createOrderMutation = useCreateRazorpayOrderMutation();
  const verifyMutation = useVerifyPaymentMutation();
  const { showToast } = useToastStore();
  const { data: session } = authClient.useSession();
  const colorScheme = useColorScheme();
  const [activeTab, setActiveTab] = useState<"pending" | "paid">("pending");

  if (duesLoading || flatsLoading) {
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

  const pendingDues = dues?.filter((d: any) => d.status === "PENDING") ?? [];
  const paidDues = dues?.filter((d: any) => d.status === "PAID") ?? [];

  const activeList = activeTab === "pending" ? pendingDues : paidDues;

  const totalOutstanding = pendingDues.reduce((acc: number, curr: any) => acc + curr.amount, 0);

  const handlePayNow = async (due: any) => {
    try {
      showToast("Initializing transaction...", "info");
      
      // 1. Create order on backend
      const orderData = await createOrderMutation.mutateAsync(due.id);
      
      // 2. Open Razorpay Checkout SDK
      const RazorpayCheckout = require("react-native-razorpay").default;
      
      const options = {
        key: orderData.keyId || env.EXPO_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Portl Society Management",
        description: `Maintenance bill for ${due.month}`,
        order_id: orderData.orderId,
        prefill: {
          email: session?.user?.email || "",
          contact: "",
          name: session?.user?.name || "",
        },
        theme: { color: "#b45309" },
      };

      RazorpayCheckout.open(options)
        .then(async (data: any) => {
          showToast("Verifying payment receipt...", "info");

          // 3. Post verification params to backend
          await verifyMutation.mutateAsync({
            dueId: due.id,
            razorpay_payment_id: data.razorpay_payment_id,
            razorpay_order_id: data.razorpay_order_id,
            razorpay_signature: data.razorpay_signature,
          });

          showToast("Payment completed successfully! 🎉", "success");
        })
        .catch((error: any) => {
          console.error("Razorpay payment error:", error);
          showToast(error.description || "Payment cancelled or failed", "error");
        });
    } catch (err: any) {
      console.error("Create order failed:", err);
      showToast(err.message || "Failed to initialize payment", "error");
    }
  };

  const isLight = colorScheme === "light";
  const borderCol = isLight ? "border-zinc-200" : "border-zinc-800";
  const activeTabCol = "bg-amber-600 dark:bg-amber-700";
  const tabLabelActive = "text-white font-bold";
  const tabLabelInactive = "text-zinc-500 dark:text-zinc-400 font-semibold";

  return (
    <ScreenContainer contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
      {/* 1. Header Dues summary Card */}
      <Card className="mb-6 border border-amber-500/20 bg-amber-500/5 p-6">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs uppercase tracking-wider font-semibold">
              Total Outstanding
            </Text>
            <Text className="text-foreground-light dark:text-foreground-dark text-3xl font-black mt-1">
              ₹{totalOutstanding.toLocaleString()}
            </Text>
          </View>
          <View className="bg-amber-600/10 p-3.5 rounded-full border border-amber-600/20">
            <Ionicons name="wallet-outline" size={24} color="#b45309" />
          </View>
        </View>
      </Card>

      {/* 2. Dues list Tabs switch */}
      <View className={`flex-row border-b ${borderCol} mb-6`}>
        <Pressable
          onPress={() => setActiveTab("pending")}
          className={`flex-1 items-center py-3.5 border-b-2 ${
            activeTab === "pending" ? "border-amber-600 dark:border-amber-500" : "border-transparent"
          }`}
        >
          <Text className={activeTab === "pending" ? "text-amber-600 dark:text-amber-500 font-bold" : "text-zinc-500 font-semibold"}>
            Pending Bills ({pendingDues.length})
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("paid")}
          className={`flex-1 items-center py-3.5 border-b-2 ${
            activeTab === "paid" ? "border-amber-600 dark:border-amber-500" : "border-transparent"
          }`}
        >
          <Text className={activeTab === "paid" ? "text-amber-600 dark:text-amber-500 font-bold" : "text-zinc-500 font-semibold"}>
            Payment History ({paidDues.length})
          </Text>
        </Pressable>
      </View>

      {/* 3. Render Dues List */}
      <ScrollView className="flex-1">
        {activeList.length === 0 ? (
          <Card className="p-8 items-center border border-dashed">
            <Ionicons
              name={activeTab === "pending" ? "receipt-outline" : "checkmark-circle-outline"}
              size={36}
              color="#71717a"
              style={{ marginBottom: 12 }}
            />
            <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-center text-sm">
              {activeTab === "pending"
                ? "Excellent! No pending maintenance bills due."
                : "No payment receipts found in your history log."}
            </Text>
          </Card>
        ) : (
          activeList.map((due: any) => (
            <Card key={due.id} className="mb-4 p-5">
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-1">
                  <Text className="text-foreground-light dark:text-foreground-dark text-lg font-bold">
                    {due.month} Maintenance
                  </Text>
                  <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-1">
                    Flat {due.flat.tower.name} - {due.flat.number}
                  </Text>
                  <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs mt-0.5">
                    {due.status === "PENDING"
                      ? `Due by: ${new Date(due.dueDate).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}`
                      : `Paid on: ${new Date(due.paidAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}`}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-foreground-light dark:text-foreground-dark text-xl font-black">
                    ₹{due.amount.toLocaleString()}
                  </Text>
                  <Chip
                    size="sm"
                    variant="soft"
                    color={due.status === "PENDING" ? "warning" : "success"}
                    className="mt-2"
                  >
                    <Chip.Label>{due.status}</Chip.Label>
                  </Chip>
                </View>
              </View>

              {due.status === "PENDING" && (
                <Pressable
                  disabled={createOrderMutation.isPending || verifyMutation.isPending}
                  onPress={() => handlePayNow(due)}
                  className="bg-amber-700 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500 py-3 rounded-xl items-center flex-row justify-center active:opacity-90 border border-amber-800"
                >
                  {createOrderMutation.isPending || verifyMutation.isPending ? (
                    <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 8 }} />
                  ) : (
                    <Ionicons name="card-outline" size={16} color="#ffffff" style={{ marginRight: 8 }} />
                  )}
                  <Text className="text-white font-bold text-sm">Pay Outstanding Due</Text>
                </Pressable>
              )}

              {due.status === "PAID" && (
                <View className="bg-zinc-100 dark:bg-zinc-800/40 p-3 rounded-xl flex-row justify-between items-center border border-zinc-200/50 dark:border-zinc-800/50">
                  <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs">
                    ID: {due.razorpayPaymentId || "N/A"}
                  </Text>
                  <View className="flex-row items-center">
                    <Ionicons name="shield-checkmark-outline" size={12} color="#10b981" style={{ marginRight: 4 }} />
                    <Text className="text-emerald-600 dark:text-emerald-500 text-xxs font-bold">Secured</Text>
                  </View>
                </View>
              )}
            </Card>
          ))
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
export default ResidentDuesView;
