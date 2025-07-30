import { create } from "zustand";


interface AIStore {
  isSearchDialogOpen: boolean;
  openSearchDialog: () => void;
  closeSearchDialog: () => void;
}

export const useAIStore = create<AIStore>((set) => ({
  isSearchDialogOpen: false,
  openSearchDialog: () => set({ isSearchDialogOpen: true }),
  closeSearchDialog: () => set({ isSearchDialogOpen: false }),
}));
