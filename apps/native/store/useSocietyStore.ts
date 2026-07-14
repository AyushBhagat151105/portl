import { create } from "zustand";

interface SocietyStore {
  currentRole: "resident" | "guard" | "admin";
  activeGateCallVisitorId: string | null;
  visitorSearch: string;
  activeTab: string;
  setRole: (role: "resident" | "guard" | "admin") => void;
  setActiveGateCallVisitorId: (id: string | null) => void;
  setVisitorSearch: (search: string) => void;
  setActiveTab: (tab: string) => void;
  reset: () => void;
}

export const useSocietyStore = create<SocietyStore>((set) => ({
  currentRole: "resident",
  activeGateCallVisitorId: null,
  visitorSearch: "",
  activeTab: "home",
  setRole: (currentRole) => set({ currentRole }),
  setActiveGateCallVisitorId: (activeGateCallVisitorId) => set({ activeGateCallVisitorId }),
  setVisitorSearch: (visitorSearch) => set({ visitorSearch }),
  setActiveTab: (activeTab) => set({ activeTab }),
  reset: () => set({ currentRole: "resident", activeGateCallVisitorId: null, visitorSearch: "", activeTab: "home" }),
}));
export default useSocietyStore;
