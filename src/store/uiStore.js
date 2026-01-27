import { create } from 'zustand';

export const useUIStore = create((set) => ({
	currentView: 'dashboard',
	isSidebarExpanded: false,
	setCurrentView: (view) => set({ currentView: view }),
	setSidebarExpanded: (expanded) => set({ isSidebarExpanded: expanded }),
	toggleSidebar: () => set((state) => ({ isSidebarExpanded: !state.isSidebarExpanded })),
}));
