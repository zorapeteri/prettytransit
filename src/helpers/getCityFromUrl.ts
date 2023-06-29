import cities from '@/constants/cities'

export function getCityFromUrl(): string {
  const city = (location.pathname.split('/').filter(Boolean)[0] || '').toLowerCase()
  if (!cities.includes(city)) {
    const startsWith = cities.find((_city) => _city.startsWith(city))
    if (startsWith) return startsWith
    location.assign('/')
    return ''
  }
  document.title += ` @ ${city}`
  return city
}
