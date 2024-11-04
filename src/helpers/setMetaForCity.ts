import { cityNames } from '@/constants/cityNames'

export function setMetaForCity(city: string) {
  document
    .querySelector('meta[property="og:url"]')
    ?.setAttribute('content', `https://prettytransit.zora.pt/${city}`)

  const cityName = (cityNames as any)[city]

  const title = `prettytransit @ ${cityName.toLowerCase()}`
  const description = `A timelapse visualization of the public transit system in ${cityName}`

  document.title = title
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', title)

  document.querySelector('meta[name="description"]')?.setAttribute('content', description)
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', description)
}
