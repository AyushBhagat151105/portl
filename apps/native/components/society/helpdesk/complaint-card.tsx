import React from "react";
import { View, Text, ScrollView, Image, Pressable } from "react-native";
import { Chip } from "heroui-native";
import { Card, CardTitle, CardDescription } from "../../ui/card";

export type Complaint = {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string;
  flat?: {
    number: string;
    tower: { name: string };
  };
  images?: string[];
};

interface ComplaintCardProps {
  complaint: Complaint;
  onSelectImage: (url: string) => void;
}

export function ComplaintCard({ complaint, onSelectImage }: ComplaintCardProps) {
  return (
    <Card className="mb-3 border border-border-light dark:border-border-dark bg-muted-light/5 dark:bg-muted-dark/5">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1 pr-2">
          <CardTitle>{complaint.title}</CardTitle>
          <CardDescription>{complaint.description}</CardDescription>
        </View>
        <View className="items-end">
          <Chip
            size="sm"
            color={
              complaint.status === "RESOLVED"
                ? "success"
                : complaint.status === "IN_PROGRESS"
                ? "accent"
                : "warning"
            }
          >
            {/* Direct children works best with type safety */}
            {complaint.status}
          </Chip>
        </View>
      </View>

      {complaint.images && complaint.images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 mt-3 mb-1">
          {complaint.images.map((img: string, idx: number) => (
            <Pressable
              key={img + idx}
              onPress={() => onSelectImage(img)}
              className="border border-border-light dark:border-border-dark rounded-xl overflow-hidden mr-2 active:scale-95"
              accessibilityRole="button"
              accessibilityLabel="View complaint image attachment"
            >
              <Image source={{ uri: img }} className="w-20 h-20" />
            </Pressable>
          ))}
        </ScrollView>
      )}

      <View className="flex-row justify-between items-center border-t border-border-light/40 dark:border-border-dark/40 pt-2.5 mt-2">
        <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs">
          Category: {complaint.category}
        </Text>
        {complaint.flat && (
          <Text className="text-muted-foreground-light dark:text-muted-foreground-dark text-xxs">
            Flat: {complaint.flat.tower.name} - {complaint.flat.number}
          </Text>
        )}
      </View>
    </Card>
  );
}
export default ComplaintCard;
