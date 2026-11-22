import { fetchWeatherApi } from 'openmeteo'
import { SeaReading } from '../models/SeaReading.js'

export const GOA_COORDINATES = {
  latitude: 15.2993,
  longitude: 74.124,
  locationName: 'Goa coast',
}

function skyFromCode(code: number | undefined) {
  if (code === undefined) return 'Conditions unavailable'
  if (code === 0) return 'Clear'
  if (code <= 3) return 'Partly cloudy'
  if (code <= 48) return 'Foggy'
  if (code <= 67) return 'Rain'
  if (code <= 77) return 'Snow'
  if (code <= 82) return 'Rain showers'
  if (code <= 99) return 'Thunderstorm'
  return 'Conditions available'
}

function closestArrayIndex(
  start: number,
  interval: number,
  end: number,
  utcOffsetSeconds: number,
  target = Date.now(),
) {
  const targetUnix = target / 1000 - utcOffsetSeconds
  const count = Math.floor((end - start) / interval)
  let closest = 0
  let smallestDistance = Number.POSITIVE_INFINITY
  for (let index = 0; index < count; index += 1) {
    const distance = Math.abs(start + index * interval - targetUnix)
    if (distance < smallestDistance) {
      smallestDistance = distance
      closest = index
    }
  }
  return closest
}

export async function refreshOpenMeteoSeaReading() {
  const marineParams = {
    latitude: GOA_COORDINATES.latitude,
    longitude: GOA_COORDINATES.longitude,
    hourly: 'wave_height',
    forecast_days: 7,
  }
  const marineResponses = await fetchWeatherApi(
    'https://marine-api.open-meteo.com/v1/marine',
    marineParams,
  )
  const marine = marineResponses[0]
  const marineHourly = marine.hourly()
  if (!marineHourly) throw new Error('Open-Meteo marine hourly data unavailable')

  const marineIndex = closestArrayIndex(
    Number(marineHourly.time()),
    marineHourly.interval(),
    Number(marineHourly.timeEnd()),
    marine.utcOffsetSeconds(),
  )
  const waveHeight = marineHourly.variables(0)?.valuesArray()?.[marineIndex]

  const forecastResponses = await fetchWeatherApi(
    'https://api.open-meteo.com/v1/forecast',
    {
      latitude: GOA_COORDINATES.latitude,
      longitude: GOA_COORDINATES.longitude,
      hourly: 'wind_speed_10m,visibility,weather_code',
      forecast_days: 2,
      timezone: 'Asia/Kolkata',
    },
  )
  const forecast = forecastResponses[0]
  const forecastHourly = forecast.hourly()
  if (!forecastHourly) throw new Error('Open-Meteo forecast hourly data unavailable')

  const forecastIndex = closestArrayIndex(
    Number(forecastHourly.time()),
    forecastHourly.interval(),
    Number(forecastHourly.timeEnd()),
    forecast.utcOffsetSeconds(),
  )
  const windSpeedKph = forecastHourly.variables(0)?.valuesArray()?.[forecastIndex]
  const visibilityMetres = forecastHourly.variables(1)?.valuesArray()?.[forecastIndex]
  const weatherCode = forecastHourly.variables(2)?.valuesArray()?.[forecastIndex]

  const observedAt = new Date()
  const reading = await SeaReading.create({
    locationName: GOA_COORDINATES.locationName,
    latitude: GOA_COORDINATES.latitude,
    longitude: GOA_COORDINATES.longitude,
    windSpeedKph: Number.isFinite(windSpeedKph) ? Math.max(0, Number(windSpeedKph)) : 0,
    waveHeightM: Number.isFinite(waveHeight) ? Math.max(0, Number(waveHeight)) : 0,
    visibilityKm: Number.isFinite(visibilityMetres)
      ? Math.max(0, Number(visibilityMetres) / 1000)
      : 0,
    sky: skyFromCode(Number.isFinite(weatherCode) ? Number(weatherCode) : undefined),
    advisory: 'Open-Meteo forecast only - verify an official marine advisory before sea travel.',
    source: 'Open-Meteo',
    sourceUrl: 'https://open-meteo.com/',
    observedAt,
  })

  return reading
}
