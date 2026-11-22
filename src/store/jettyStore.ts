import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ResponseStatus = 'PENDING' | 'ACKNOWLEDGED' | 'FAMILY_CONTACTED' | 'RESOLVED'
type ResponseState = {
  response: ResponseStatus
  acknowledgedAt: string | null
  familyContactedAt: string | null
  resolvedAt: string | null
  setResponse: (response: ResponseStatus) => void
  resetResponse: () => void
}
const initial = { response: 'PENDING' as ResponseStatus, acknowledgedAt: null, familyContactedAt: null, resolvedAt: null }
const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('matsya-jetty-response') : null
export const useJettyStore = create<ResponseState>()(persist((set, get) => ({
  ...initial,
  setResponse: (response) => {
    const now = new Date().toISOString()
    const next = {
      ...get(), response,
      acknowledgedAt: response === 'ACKNOWLEDGED' ? now : get().acknowledgedAt,
      familyContactedAt: response === 'FAMILY_CONTACTED' ? now : get().familyContactedAt,
      resolvedAt: response === 'RESOLVED' ? now : get().resolvedAt,
    }
    set(next)
    channel?.postMessage(next)
  },
  resetResponse: () => { set(initial); channel?.postMessage(initial) },
}), { name: 'matsya-jetty-response-demo' }))
if (channel) channel.onmessage = (event: MessageEvent) => {
  const next = event.data as Partial<ResponseState>
  if (next && ['PENDING','ACKNOWLEDGED','FAMILY_CONTACTED','RESOLVED'].includes(next.response ?? '')) {
    useJettyStore.setState({ response: next.response, acknowledgedAt: next.acknowledgedAt ?? null, familyContactedAt: next.familyContactedAt ?? null, resolvedAt: next.resolvedAt ?? null })
  }
}
