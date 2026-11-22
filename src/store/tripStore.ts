import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getCurrentTrip, getFamilyTrips, resetTrip, startTrip, updateTripStatus, updateTripLocation } from '../services/tripApi'

export type TripStatus = 'IDLE' | 'CHECK_IN' | 'TRIP_ACTIVE' | 'CONNECTIVITY_WEAK' | 'LORA_RELAY' | 'SOS_SENT' | 'EMERGENCY_ACTIVE' | 'SAFE_RETURN'
type TripState = {
  tripId: string | null
  status: TripStatus
  lastUpdate: string | null
  battery: number
  lastLocation: string
  loading: boolean
  error: string | null
  setStatus: (status: TripStatus) => Promise<void>
  resetDemo: () => Promise<void>
  loadCurrent: () => Promise<void>
  loadFamily: () => Promise<void>
}
const initial = { tripId: null, status: 'IDLE' as TripStatus, lastUpdate: null, battery: 92, lastLocation: 'Not available' }
export const useTripStore = create<TripState>()(persist((set) => ({
  ...initial,
  loading: false,
  error: null,
  setStatus: async (status) => {
    set({ loading: true, error: null })
    try {
      let tripId = useTripStore.getState().tripId
      let trip
      if (!tripId) {
        const result = await startTrip()
        trip = result.trip
        tripId = trip.id
      }
      if (status !== 'CHECK_IN') {
        if (!tripId) return
        const result = await updateTripStatus(tripId, status)
        trip = result.trip
      }
      if (trip) {
        set({
          tripId: trip.active ? trip.id : null,
          status: trip.status,
          lastUpdate: trip.lastUpdatedAt,
          battery: trip.battery,
          lastLocation: trip.lastLocation,
          loading: false,
          error: null,
        })
        if (navigator.geolocation && trip.latitude == null && trip.longitude == null) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              void updateTripLocation(trip.id, {
                location: 'Beacon/GPS demo point',
                battery: trip.battery,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              }).then((locationResult) => set({
                status: locationResult.trip.status,
                lastLocation: locationResult.trip.lastLocation,
                lastUpdate: locationResult.trip.lastUpdatedAt,
                battery: locationResult.trip.battery,
              })).catch((error) => console.error(error))
            },
            () => undefined,
          )
        }
      }
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Unable to update trip',
      })
      console.error(error)
    }
  },
  resetDemo: async () => {
    set({ loading: true, error: null })
    try {
      await resetTrip()
      set({ ...initial, loading: false, error: null })
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Unable to reset trip',
      })
      console.error(error)
    }
  },
  loadCurrent: async () => {
    try {
      const result = await getCurrentTrip()
      const trip = result.trip
      set(trip ? {
        tripId: trip.id,
        status: trip.status,
        lastUpdate: trip.lastUpdatedAt,
        battery: trip.battery,
        lastLocation: trip.lastLocation,
      } : initial)
    } catch (error) {
      console.error(error)
    }
  },
  loadFamily: async () => {
    try {
      const result = await getFamilyTrips()
      const trip = result.trips[0]
      set(trip ? {
        tripId: trip.id,
        status: trip.status,
        lastUpdate: trip.lastUpdatedAt,
        battery: trip.battery,
        lastLocation: trip.lastLocation,
      } : initial)
    } catch (error) {
      console.error(error)
    }
  },
}), { name: 'matsya-trip-demo' }))
