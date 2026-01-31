import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      login: (token, user) => {
        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false
        })
        // Also store in localStorage for backup
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('role', user.role)
      },

      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false
        })
        // Clear localStorage
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('role')
      },

      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData }
        }))
        // Update localStorage
        const updatedUser = { ...get().user, ...userData }
        localStorage.setItem('user', JSON.stringify(updatedUser))
      },

      setLoading: (loading) => {
        set({ isLoading: loading })
      },

      // Getters
      getUserRole: () => get().user?.role,
      getUserName: () => get().user?.name,
      getUserEmail: () => get().user?.email,

      // Initialize from localStorage
      initializeAuth: () => {
        const token = localStorage.getItem('token')
        const userStr = localStorage.getItem('user')
        
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr)
            set({
              token,
              user,
              isAuthenticated: true,
              isLoading: false
            })
          } catch (error) {
            console.error('Failed to parse user data:', error)
            // Clear invalid data
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            localStorage.removeItem('role')
          }
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

export { useAuthStore }
