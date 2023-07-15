import cities from '@/constants/cities'
import { setMetaForCity } from './setMetaForCity'

export function getCityFromUrl(): string {
  const city = (location.pathname.split('/').filter(Boolean)[0] || '').toLowerCase()
  if (!(cities as any).includes(city)) {
    const startsWith = cities.filter((_city) => _city.startsWith(city))
    if (startsWith.length === 1) return startsWith[0]
    location.assign('/')
    return ''
  }
  setMetaForCity(city)
  return city
}
