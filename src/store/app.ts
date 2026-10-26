'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  name?: string | null
  phone?: string | null
  role: 'CUSTOMER' | 'BUSINESS_OWNER'
}

export interface Business {
  id: string
  name: string
  description: string
  category: string
  subcategory?: string | null
  tags: string
  phone: string
  whatsapp?: string | null
  email?: string | null
  website?: string | null
  address: string
  city: string
  state: string
  pincode?: string | null
  lat: number
  lng: number
  rating: number
  reviewCount: number
  verified: boolean
  premium: boolean
  isB2B: boolean
  isB2C: boolean
  template: string
  websiteTemplate: string
  imageColor: string
  emoji: string
  hours: string
  products: string
  imageUrls: string
  profileImage: string
  liveTracking: boolean
  reviews?: any[]
  distance?: number
}

// Nearby Place from OpenStreetMap (Overpass API) — not in our DB
export interface NearbyPlace {
  id: string
  name: string
  category: string
  emoji: string
  imageColor: string
  type: string
  address: string
  phone: string
  website: string
  lat: number
  lng: number
  distance: number
  source: 'openstreetmap'
}

interface AppState {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void

  // Search & filters
  searchQuery: string
  cityQuery: string
  userLat: number | null
  userLng: number | null
  isLocating: boolean
  selectedCategory: string
  minRating: number
  businessType: 'B2B' | 'B2C' | null
  verifiedOnly: boolean
  premiumOnly: boolean
  radius: number
  sortBy: 'relevance' | 'rating' | 'distance' | 'reviews'

  setSearchQuery: (q: string) => void
  setCityQuery: (q: string) => void
  setLocation: (lat: number, lng: number) => void
  setIsLocating: (v: boolean) => void
  setSelectedCategory: (c: string) => void
  setMinRating: (r: number) => void
  setBusinessType: (t: 'B2B' | 'B2C' | null) => void
  setVerifiedOnly: (v: boolean) => void
  setPremiumOnly: (v: boolean) => void
  setRadius: (r: number) => void
  setSortBy: (s: 'relevance' | 'rating' | 'distance' | 'reviews') => void

  clearFilters: () => void

  // UI state
  activeTab: 'discover' | 'map' | 'categories'
  setActiveTab: (t: 'discover' | 'map' | 'categories') => void
  selectedBusinessId: string | null
  setSelectedBusinessId: (id: string | null) => void
  showListModal: boolean
  setShowListModal: (v: boolean) => void
  showAuthModal: boolean
  setShowAuthModal: (v: boolean) => void
}

export const useApp = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),

      searchQuery: '',
      cityQuery: '',
      userLat: null,
      userLng: null,
      isLocating: false,
      selectedCategory: 'All',
      minRating: 0,
      businessType: null,
      verifiedOnly: false,
      premiumOnly: false,
      radius: 50,
      sortBy: 'relevance',

      setSearchQuery: (q) => set({ searchQuery: q }),
      setCityQuery: (q) => set({ cityQuery: q }),
      setLocation: (lat, lng) => set({ userLat: lat, userLng: lng }),
      setIsLocating: (v) => set({ isLocating: v }),
      setSelectedCategory: (c) => set({ selectedCategory: c }),
      setMinRating: (r) => set({ minRating: r }),
      setBusinessType: (t) => set({ businessType: t }),
      setVerifiedOnly: (v) => set({ verifiedOnly: v }),
      setPremiumOnly: (v) => set({ premiumOnly: v }),
      setRadius: (r) => set({ radius: r }),
      setSortBy: (s) => set({ sortBy: s }),

      clearFilters: () =>
        set({
          selectedCategory: 'All',
          minRating: 0,
          businessType: null,
          verifiedOnly: false,
          premiumOnly: false,
          radius: 50,
          sortBy: 'relevance'
        }),

      activeTab: 'discover',
      setActiveTab: (t) => set({ activeTab: t }),
      selectedBusinessId: null,
      setSelectedBusinessId: (id) => set({ selectedBusinessId: id }),
      showListModal: false,
      setShowListModal: (v) => set({ showListModal: v }),
      showAuthModal: false,
      setShowAuthModal: (v) => set({ showAuthModal: v })
    }),
    {
      name: 'businesshub-app',
      partialize: (state) => ({ user: state.user }) // persist only user session
    }
  )
)
