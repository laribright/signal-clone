import { create } from 'zustand';

type SidebarWidthState = {
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
};

export const useSidebarWidth = create<SidebarWidthState>(set => ({
  sidebarWidth: 30,
  setSidebarWidth: width => set({ sidebarWidth: width }),
}));
