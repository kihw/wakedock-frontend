import { create } from 'zustand';

interface LayoutState {
  // State
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  mounted: boolean;
  isMobile: boolean;

  // Actions
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  closeSidebarOnMobile: () => void;
  handleEscapeKey: (event: KeyboardEvent) => void;
  handleResize: () => void;
  setMounted: (mounted: boolean) => void;
}

export const useLayoutStore = create<LayoutState>((set, get) => ({
  // Initial state
  sidebarOpen: false,
  mobileMenuOpen: false,
  mounted: false,
  isMobile: false,

  // Set sidebar open/closed
  setSidebarOpen: (open: boolean) => {
    set({ sidebarOpen: open });
  },

  // Toggle sidebar
  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  // Set mobile menu open/closed
  setMobileMenuOpen: (open: boolean) => {
    set({ mobileMenuOpen: open });
  },

  // Toggle mobile menu
  toggleMobileMenu: () => {
    set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen }));
  },

  // Close mobile menu
  closeMobileMenu: () => {
    set({ mobileMenuOpen: false });
  },

  // Close sidebar on mobile
  closeSidebarOnMobile: () => {
    const state = get();
    if (state.isMobile && state.sidebarOpen) {
      set({ sidebarOpen: false });
    }
  },

  // Handle escape key
  handleEscapeKey: (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      const state = get();
      if (state.mobileMenuOpen) {
        set({ mobileMenuOpen: false });
      } else if (state.sidebarOpen && state.isMobile) {
        set({ sidebarOpen: false });
      }
    }
  },

  // Handle window resize
  handleResize: () => {
    if (typeof window === 'undefined') return;
    
    const isMobile = window.innerWidth < 769;
    const state = get();
    
    set({ isMobile });
    
    // Close mobile menu and sidebar when switching to desktop
    if (!isMobile && state.isMobile) {
      set({ 
        mobileMenuOpen: false,
        sidebarOpen: true // Open sidebar by default on desktop
      });
    }
    
    // Close sidebar when switching to mobile
    if (isMobile && !state.isMobile) {
      set({ 
        sidebarOpen: false,
        mobileMenuOpen: false 
      });
    }
  },

  // Set mounted state
  setMounted: (mounted: boolean) => {
    set({ mounted });
    
    // Initialize layout state when mounted
    if (mounted && typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 769;
      set({ 
        isMobile,
        sidebarOpen: !isMobile // Open sidebar by default on desktop
      });
    }
  },
}));