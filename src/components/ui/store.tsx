// stores/useTotalStore.ts
import { create } from "zustand";

interface TotalStore {
  totals: Record<string, number>;
  setTotalForType: (type: string, amount: number) => void;
}

export const useTotalStore = create<TotalStore>((set) => ({
  totals: {},
  setTotalForType: (type, amount) =>
    set((state) => ({
      totals: { ...state.totals, [type]: amount },
    })),
}));
