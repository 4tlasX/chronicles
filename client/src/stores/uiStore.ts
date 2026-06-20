import { create } from 'zustand';
import type { UserFieldDef, TopicCustomFields } from '../types/userFields.js';

interface UIState {
  // Sidebar
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;

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

  // Profile
  displayName: string;
  setDisplayName: (name: string) => void;

  // User-defined custom fields per topic
  topicCustomFields: TopicCustomFields;
  setTopicCustomFields: (fields: TopicCustomFields) => void;
  updateTopicFields: (topicId: number, defs: UserFieldDef[]) => void;

  // Weather widget
  weatherEnabled: boolean;
  weatherCity: string;
  weatherUnit: 'f' | 'c';
  setWeatherEnabled: (v: boolean) => void;
  setWeatherCity: (city: string) => void;
  setWeatherUnit: (unit: 'f' | 'c') => void;

  // Cycle tracking
  cycleTrackingEnabled: boolean;
  setCycleTrackingEnabled: (v: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set(s => ({ isSidebarOpen: !s.isSidebarOpen })),
  sidebarCollapsed: true,
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),

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
  headerColor: '#5b53d6',
  accentColor: '#5b53d6',
  backgroundImage: '',
  backgroundOpacity: 0.7,
  setThemeMode: (mode) => set({ themeMode: mode }),
  setHeaderColor: (color) => set({ headerColor: color }),
  setAccentColor: (color) => set({ accentColor: color }),
  setBackgroundImage: (image) => set({ backgroundImage: image }),
  setBackgroundOpacity: (opacity) => set({ backgroundOpacity: opacity }),

  displayName: '',
  setDisplayName: (name) => set({ displayName: name }),

  topicCustomFields: {},
  setTopicCustomFields: (fields) => set({ topicCustomFields: fields }),
  updateTopicFields: (topicId, defs) => set(s => ({ topicCustomFields: { ...s.topicCustomFields, [topicId]: defs } })),

  weatherEnabled: false,
  weatherCity: '',
  weatherUnit: 'f',
  setWeatherEnabled: (v) => set({ weatherEnabled: v }),
  setWeatherCity: (city) => set({ weatherCity: city }),
  setWeatherUnit: (unit) => set({ weatherUnit: unit }),

  cycleTrackingEnabled: false,
  setCycleTrackingEnabled: (v) => set({ cycleTrackingEnabled: v }),
}));
