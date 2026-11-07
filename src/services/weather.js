const LOCATIONS = {
  Pinheiros: { latitude: -23.5677, longitude: -46.7011 },
  'Vila Madalena': { latitude: -23.5505, longitude: -46.6917 },
  'Centro Histórico': { latitude: -23.5505, longitude: -46.6333 },
}

const CACHE_DURATION = 10 * 60 * 1000
const readingsCache = new Map()

const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value)

const requestJson = async (url, signal, label) => {
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error(`${label}: HTTP ${response.status}.`)
  return response.json()
}

const weatherCondition = (code, isDay) => {
  if (code === 0) return 'Céu limpo'
  if (code === 1) return 'Predominantemente limpo'
  if (code === 2) return 'Parcialmente nublado'
  if (code === 3) return 'Nublado'
  if ([45, 48].includes(code)) return 'Neblina'
  if ([51, 53, 55, 56, 57].includes(code)) return 'Garoa'
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Chuva'
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Neve'
  if ([95, 96, 99].includes(code)) return 'Trovoada'
  return 'Condição indisponível'
}

const weatherIcon = (code, isDay) => {
  if ([95, 96, 99].includes(code)) return '⛈'
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 85, 86].includes(code)) return '🌧'
  if ([45, 48].includes(code)) return '🌫'
  if ([71, 73, 75, 77].includes(code)) return '❄'
  if (code === 0 || code === 1) return isDay ? '☀' : '☾'
  return '☁'
}

export const airQualityLabel = (usAqi) => {
  if (!isFiniteNumber(usAqi) || usAqi < 0) return 'Indisponível'
  if (usAqi <= 50) return 'Boa'
  if (usAqi <= 100) return 'Moderada'
  if (usAqi <= 150) return 'Sensível'
  if (usAqi <= 200) return 'Ruim'
  if (usAqi <= 300) return 'Muito ruim'
  return 'Perigosa'
}

export const getWeatherReading = async (location, { signal, refresh = false } = {}) => {
  const coordinates = LOCATIONS[location]
  if (!coordinates) throw new Error('Selecione uma região disponível.')

  const cached = readingsCache.get(location)
  if (!refresh && cached && Date.now() - cached.receivedAt < CACHE_DURATION) return cached.value

  const parameters = new URLSearchParams({
    latitude: String(coordinates.latitude),
    longitude: String(coordinates.longitude),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code',
    hourly: 'temperature_2m,precipitation_probability',
    forecast_days: '2',
    timezone: 'America/Sao_Paulo',
  })
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?${parameters}`
  const airParameters = new URLSearchParams({
    latitude: String(coordinates.latitude),
    longitude: String(coordinates.longitude),
    current: 'us_aqi',
    timezone: 'America/Sao_Paulo',
  })
  const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?${airParameters}`

  try {
    const [weather, air] = await Promise.all([
      requestJson(weatherUrl, signal, 'Não foi possível consultar a previsão do tempo'),
      requestJson(airUrl, signal, 'Não foi possível consultar a qualidade do ar')
        .catch((error) => {
          if (error.name === 'AbortError') throw error
          return null
        }),
    ])
    const current = weather.current
    const hourly = weather.hourly
    if (
      !current
      || typeof current.time !== 'string'
      || !isFiniteNumber(current.temperature_2m)
      || !isFiniteNumber(current.relative_humidity_2m)
      || current.relative_humidity_2m < 0
      || current.relative_humidity_2m > 100
      || !isFiniteNumber(current.apparent_temperature)
      || !Number.isInteger(current.weather_code)
      || ![0, 1].includes(current.is_day)
      || !hourly
      || !Array.isArray(hourly.time)
      || !Array.isArray(hourly.temperature_2m)
      || hourly.time.length !== hourly.temperature_2m.length
      || hourly.time.some((time) => typeof time !== 'string')
      || hourly.temperature_2m.some((temperature) => !isFiniteNumber(temperature))
      || !Array.isArray(hourly.precipitation_probability)
      || hourly.precipitation_probability.length !== hourly.time.length
      || !isFiniteNumber(weather.latitude)
      || !isFiniteNumber(weather.longitude)
    ) {
      throw new Error('A fonte meteorológica retornou dados incompletos ou inválidos.')
    }

    const nextHourIndex = hourly.time.findIndex((time) => time >= current.time)
    const airQualityIndex = isFiniteNumber(air?.current?.us_aqi) && air.current.us_aqi >= 0
      ? air.current.us_aqi
      : null
    const precipitationProbability = nextHourIndex >= 0
      && isFiniteNumber(hourly.precipitation_probability[nextHourIndex])
      && hourly.precipitation_probability[nextHourIndex] >= 0
      && hourly.precipitation_probability[nextHourIndex] <= 100
      ? hourly.precipitation_probability[nextHourIndex]
      : null
    const value = {
      temperature: current.temperature_2m,
      apparentTemperature: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      weatherCode: current.weather_code,
      isDay: current.is_day === 1,
      condition: weatherCondition(current.weather_code, current.is_day === 1),
      icon: weatherIcon(current.weather_code, current.is_day === 1),
      precipitationProbability,
      precipitationTime: nextHourIndex >= 0 ? hourly.time[nextHourIndex] : null,
      airQualityIndex: isFiniteNumber(airQualityIndex) ? airQualityIndex : null,
      airQualityLabel: airQualityLabel(airQualityIndex),
      airQualityAvailable: isFiniteNumber(airQualityIndex),
      airQualityTime: typeof air?.current?.time === 'string' ? air.current.time : null,
      currentTime: current.time,
      timezone: weather.timezone,
      modelLatitude: weather.latitude,
      modelLongitude: weather.longitude,
      hourlyForecast: hourly.time.map((time, index) => ({
        time,
        temperature: hourly.temperature_2m[index],
      })).filter((hour) => hour.time >= current.time),
      source: 'Open-Meteo',
    }
    if (signal?.aborted) throw new DOMException('A solicitação foi cancelada.', 'AbortError')
    readingsCache.set(location, { value, receivedAt: Date.now() })
    return value
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new Error(`Dados climáticos indisponíveis para ${location}. ${error.message}`)
  }
}

export const clearWeatherCache = (location) => {
  if (location) readingsCache.delete(location)
  else readingsCache.clear()
}
