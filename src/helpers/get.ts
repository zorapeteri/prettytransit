export const endpoint = 'https://zorapeteri.github.io/prettytransit-gtfs-parser/'

export default function (fileName: string) {
  return fetch(endpoint + fileName + '.json').then((res) => res.json())
}
