import { create } from "zustand";

export type TreasuryTab = "balance-sheet" | "overview" | "expenses" | "festivals";
export type LedgerFilter = "ALL" | "INFLOW" | "OUTFLOW";

interface TreasuryStore {
  activeTab: TreasuryTab;
  ledgerFilter: LedgerFilter;
  setActiveTab: (tab: TreasuryTab) => void;
  setLedgerFilter: (filter: LedgerFilter) => void;
  reset: () => void;
}

export const useTreasuryStore = create<TreasuryStore>((set) => ({
  activeTab: "balance-sheet",
  ledgerFilter: "ALL",
  setActiveTab: (activeTab) => set({ activeTab }),
  setLedgerFilter: (ledgerFilter) => set({ ledgerFilter }),
  reset: () => set({ activeTab: "balance-sheet", ledgerFilter: "ALL" }),
}));

export default useTreasuryStore;
