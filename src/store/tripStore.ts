import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TripStatus = 'IDLE' | 'CHECK_IN' | 'TRIP_ACTIVE' | 'CONNECTIVITY_WEAK' | 'LORA_RELAY' | 'SOS_SENT' | 'EMERGENCY_ACTIVE' | 'SAFE_RETURN'
type TripState = {
  status: TripStatus
  lastUpdate: string | null
  battery: number
  lastLocation: string
  setStatus: (status: TripStatus) => void
  resetDemo: () => void
}
const initial = { status: 'IDLE' as TripStatus, lastUpdate: null, battery: 92, lastLocation: 'Not available' }
const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('matsya-trip-sync') : null
export const useTripStore = create<TripState>()(persist((set) => ({
  ...initial,
  setStatus: (status) => {
    const next = { status, lastUpdate: new Date().toISOString(), battery: status === 'LORA_RELAY' ? 71 : status === 'SAFE_RETURN' ? 64 : 88, lastLocation: status === 'IDLE' ? 'Not available' : 'Demo point · Arabian Sea, Goa' }
    set(next)
    channel?.postMessage(next)
  },
  resetDemo: () => {
    set(initial)
    channel?.postMessage(initial)
  },
}), { name: 'matsya-trip-demo' }))
if (channel) channel.onmessage = (event: MessageEvent) => {
  const value = event.data as Partial<TripState>
  if (value && typeof value.status === 'string') {
    useTripStore.setState({ status: value.status, lastUpdate: value.lastUpdate ?? null, battery: value.battery ?? 92, lastLocation: value.lastLocation ?? 'Not available' })
  }
}
