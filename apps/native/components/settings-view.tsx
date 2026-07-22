import React from "react";
import { Text } from "react-native";
import { ScreenContainer } from "./ui/screen-container";
import { ProfileDetailsCard } from "./settings/profile-details-card";
import { ChangeEmailCard } from "./settings/change-email-card";
import { ChangePasswordCard } from "./settings/change-password-card";

export function SettingsView() {
  return (
    <ScreenContainer contentContainerStyle={{ padding: 20, gap: 20 }}>
      <Text className="text-xl font-bold text-foreground-light dark:text-foreground-dark mt-2">
        Account Settings
      </Text>

      <ProfileDetailsCard />
      <ChangeEmailCard />
      <ChangePasswordCard />
    </ScreenContainer>
  );
}

export default SettingsView;
