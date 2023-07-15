import cities from '@/constants/cities'
import { cityNames } from '@/constants/cityNames'

export function getCityFromUrl(): string {
  const city = (location.pathname.split('/').filter(Boolean)[0] || '').toLowerCase()
  if (!(cities as any).includes(city)) {
    const startsWith = cities.filter((_city) => _city.startsWith(city))
    if (startsWith.length === 1) return startsWith[0]
    location.assign('/')
    return ''
  }
  document.title = `prettytransit @ ${(cityNames as any)[city].toLowerCase()}`
  return city
}
