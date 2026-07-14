import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useStaffQuery } from "../../queries/society";
import { ScreenContainer } from "../ui/screen-container";
import { Card, CardTitle, CardDescription } from "../ui/card";
import { Loader } from "../ui/loader";

export function DirectoryView() {
  const { data: staff, isLoading } = useStaffQuery();

  if (isLoading) {
    return <Loader />;
  }

  return (
    <ScreenContainer contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
      <Text className="text-foreground-light dark:text-foreground-dark text-xl font-bold mb-4">
        Society Staff Directory
      </Text>

      {!staff || staff.length === 0 ? (
        <Card className="items-center p-6">
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-sm">
            No society staff registered.
          </Text>
        </Card>
      ) : (
        staff.map((st: any) => (
          <Card key={st.id} className="mb-3">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <CardTitle>{st.name}</CardTitle>
                <CardDescription>{`Role: ${st.role}`}</CardDescription>
                <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs mt-0.5">
                  Phone: {st.phone}
                </Text>
              </View>
              <View className="bg-muted-light dark:bg-muted-dark p-2.5 rounded-full items-center justify-center border border-border-light dark:border-border-dark">
                <Ionicons name="call-outline" size={20} color="#b45309" />
              </View>
            </View>
          </Card>
        ))
      )}
    </ScreenContainer>
  );
}
export default DirectoryView;
