import { afterEach, describe, expect, it, vi } from 'vitest'
import { airQualityLabel, clearWeatherCache, getWeatherReading } from './weather.js'

const weatherResponse = {
  latitude: -23.58,
  longitude: -46.66,
  timezone: 'America/Sao_Paulo',
  current: {
    time: '2026-11-07T02:30',
    temperature_2m: 19.4,
    relative_humidity_2m: 96,
    apparent_temperature: 22.1,
    is_day: 0,
    weather_code: 61,
  },
  hourly: {
    time: ['2026-11-07T02:00', '2026-11-07T03:00', '2026-11-07T04:00'],
    temperature_2m: [19.7, 19.4, 19.3],
    precipitation_probability: [2, 18, 30],
  },
}

const response = (body, ok = true) => ({
  ok,
  status: ok ? 200 : 503,
  json: async () => body,
})

afterEach(() => {
  clearWeatherCache()
  vi.unstubAllGlobals()
})

describe('Open-Meteo weather service', () => {
  it('loads live modeled conditions, air quality, and the next forecast hour', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response(weatherResponse))
      .mockResolvedValueOnce(response({
        current: { time: '2026-11-07T02:00', us_aqi: 68 },
      }))
    vi.stubGlobal('fetch', fetchMock)

    const reading = await getWeatherReading('Pinheiros')

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[0][0]).toContain('latitude=-23.5677')
    expect(fetchMock.mock.calls[0][0]).toContain('temperature_2m')
    expect(fetchMock.mock.calls[1][0]).toContain('current=us_aqi')
    expect(reading).toMatchObject({
      temperature: 19.4,
      apparentTemperature: 22.1,
      humidity: 96,
      condition: 'Chuva',
      precipitationProbability: 18,
      precipitationTime: '2026-11-07T03:00',
      airQualityIndex: 68,
      airQualityLabel: 'Moderada',
      airQualityTime: '2026-11-07T02:00',
      source: 'Open-Meteo',
    })
    expect(reading.hourlyForecast).toHaveLength(2)
  })

  it('keeps weather available when the air-quality source is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(response(weatherResponse))
      .mockRejectedValueOnce(new Error('Serviço temporariamente indisponível')))

    const reading = await getWeatherReading('Pinheiros')

    expect(reading.temperature).toBe(19.4)
    expect(reading.airQualityAvailable).toBe(false)
    expect(reading.airQualityLabel).toBe('Indisponível')
  })

  it('marks invalid optional measurements unavailable without inventing replacements', async () => {
    const weather = structuredClone(weatherResponse)
    weather.hourly.precipitation_probability[1] = 140
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(response(weather))
      .mockResolvedValueOnce(response({
        current: { time: 23, us_aqi: -1 },
      })))

    const reading = await getWeatherReading('Pinheiros')

    expect(reading.precipitationProbability).toBeNull()
    expect(reading.airQualityAvailable).toBe(false)
    expect(reading.airQualityTime).toBeNull()
  })

  it('reports weather source errors instead of fabricating values', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({}, false)))

    await expect(getWeatherReading('Centro Histórico')).rejects.toThrow(
      'Dados climáticos indisponíveis para Centro Histórico.',
    )
  })

  it('maps AQI values to the documented ranges and leaves missing data unavailable', () => {
    expect(airQualityLabel(30)).toBe('Boa')
    expect(airQualityLabel(80)).toBe('Moderada')
    expect(airQualityLabel(120)).toBe('Sensível')
    expect(airQualityLabel(180)).toBe('Ruim')
    expect(airQualityLabel(250)).toBe('Muito ruim')
    expect(airQualityLabel(320)).toBe('Perigosa')
    expect(airQualityLabel(null)).toBe('Indisponível')
    expect(airQualityLabel(-1)).toBe('Indisponível')
  })
})
