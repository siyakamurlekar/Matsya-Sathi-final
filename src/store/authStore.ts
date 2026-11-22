import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type UserRole = 'fisherman' | 'family' | 'jetty'
export interface User { name: string; phone: string; role: UserRole }
interface AuthState {
  selectedRole: UserRole | null
  user: User | null
  setSelectedRole: (role: UserRole) => void
  login: (user: User) => void
  logout: () => void
}
// Per-tab demo sessions: fisherman and family can remain logged in in separate tabs.
// Trip data is still shared separately by tripStore.
export const useAuthStore = create<AuthState>()(
  persist((set) => ({
    selectedRole: null,
    user: null,
    setSelectedRole: (role) => set({ selectedRole: role }),
    login: (user) => set({ user, selectedRole: user.role }),
    logout: () => {
      localStorage.removeItem('matsya-api-token')
      set({ user: null, selectedRole: null })
    },
  }), {
    name: 'matsya-auth-tab-v2',
    storage: createJSONStorage(() => sessionStorage),
  })
)
