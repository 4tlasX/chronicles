import { create } from 'zustand';

interface UIState {
  // Sidebar
  isSidebarOpen: boolean;
  toggleSidebar: () => void;

  // Search
  searchKeyword: string;
  searchDateFrom: string;
  searchDateTo: string;
  isSearchActive: boolean;
  setSearchKeyword: (keyword: string) => void;
  setSearchDateFrom: (date: string) => void;
  setSearchDateTo: (date: string) => void;
  clearSearch: () => void;

  // View mode
  viewMode: 'date' | 'all' | 'tasks' | 'favorites' | 'search';
  setViewMode: (mode: UIState['viewMode']) => void;

  // Selected date for date view
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;

  // Selected topic filter
  selectedTopicId: number | null;
  setSelectedTopicId: (id: number | null) => void;

  // Selected entry
  selectedEntryId: number | null;
  setSelectedEntryId: (id: number | null) => void;

  // Mobile editor visibility
  showMobileEditor: boolean;
  setShowMobileEditor: (show: boolean) => void;

  // Drawing / Apple Pencil
  pencilOnly: boolean;
  setPencilOnly: (v: boolean) => void;

  // Theme (runtime overrides from settings)
  themeMode: 'light' | 'dark';
  headerColor: string;
  accentColor: string;
  backgroundImage: string;
  backgroundOpacity: number;
  setThemeMode: (mode: 'light' | 'dark') => void;
  setHeaderColor: (color: string) => void;
  setAccentColor: (color: string) => void;
  setBackgroundImage: (image: string) => void;
  setBackgroundOpacity: (opacity: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set(s => ({ isSidebarOpen: !s.isSidebarOpen })),

  searchKeyword: '',
  searchDateFrom: '',
  searchDateTo: '',
  isSearchActive: false,
  setSearchKeyword: (keyword) => set({ searchKeyword: keyword, isSearchActive: keyword.length > 0 }),
  setSearchDateFrom: (date) => set({ searchDateFrom: date }),
  setSearchDateTo: (date) => set({ searchDateTo: date }),
  clearSearch: () => set({ searchKeyword: '', searchDateFrom: '', searchDateTo: '', isSearchActive: false }),

  viewMode: 'date',
  setViewMode: (mode) => set({ viewMode: mode }),

  selectedDate: new Date(),
  setSelectedDate: (date) => set({ selectedDate: date }),

  selectedTopicId: null,
  setSelectedTopicId: (id) => set({ selectedTopicId: id }),

  selectedEntryId: null,
  setSelectedEntryId: (id) => set({ selectedEntryId: id }),

  showMobileEditor: false,
  setShowMobileEditor: (show) => set({ showMobileEditor: show }),

  pencilOnly: true,
  setPencilOnly: (v) => set({ pencilOnly: v }),

  themeMode: 'light',
  headerColor: '#4E6E7E',
  accentColor: '#00b4d8',
  backgroundImage: '',
  backgroundOpacity: 0.7,
  setThemeMode: (mode) => set({ themeMode: mode }),
  setHeaderColor: (color) => set({ headerColor: color }),
  setAccentColor: (color) => set({ accentColor: color }),
  setBackgroundImage: (image) => set({ backgroundImage: image }),
  setBackgroundOpacity: (opacity) => set({ backgroundOpacity: opacity }),
}));
