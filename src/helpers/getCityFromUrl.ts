import cities from '@/constants/cities'
import { cityNames } from '@/constants/cityNames'

export function getCityFromUrl(): string {
  const city = (location.pathname.split('/').filter(Boolean)[0] || '').toLowerCase()
  if (!(cities as any).includes(city)) {
    const startsWith = cities.find((_city) => _city.startsWith(city))
    if (startsWith) return startsWith
    location.assign('/')
    return ''
  }
  document.title += ` @ ${(cityNames as any)[city].toLowerCase()}`
  return city
}
