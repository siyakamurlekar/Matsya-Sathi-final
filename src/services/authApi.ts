export interface ApiUser {
  id: string
  name: string
  phone: string
  role: 'fisherman' | 'family' | 'jetty'
  village: string
  boatName: string
  latitude: number | null
  longitude: number | null
  nearbyRadiusKm: number
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('matsya-api-token')
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const body = await response.json().catch(() => ({ error: 'Unexpected server response' }))
  if (!response.ok) throw new Error(body.error || 'Request failed')
  return body as T
}

export function register(input: {
  name: string
  phone: string
  password: string
  role: 'fisherman' | 'family' | 'jetty'
  village?: string
  boatName?: string
}) {
  return request<{ token: string; user: ApiUser }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function login(input: {
  phone: string
  password: string
  role?: 'fisherman' | 'family' | 'jetty'
}) {
  return request<{ token: string; user: ApiUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function getProfile() {
  return request<{ user: ApiUser }>('/auth/me')
}

export function updateProfile(input: {
  name?: string
  village?: string
  boatName?: string
  latitude?: number | null
  longitude?: number | null
  nearbyRadiusKm?: number
}) {
  return request<{ user: ApiUser }>('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}
