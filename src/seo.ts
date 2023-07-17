// @ts-ignore
import * as fs from 'fs'
import cities from './constants/cities'
import { cityNames } from './constants/cityNames'

const htmlContent = fs.readFileSync('dist/index.html', 'utf8')
const seoContent = htmlContent.split('<!-- seo start -->')[1].split('<!-- seo end -->')[0]

function makeSeoTags(city: string, title: string, description: string) {
  return /*html*/ `
    <meta name="title" content="${title}" />
    <meta
      name="description"
      content="${description}"
    />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://prettytransit.com/${city}" />
    <meta property="og:title" content="${title}" />
    <meta
      property="og:description"
      content="${description}"
    />
    <meta property="og:image" content="https://prettytransit.com/screenshots/main.png" />
    `
}

async function getTransportTypes(city: string) {
  return new Promise((resolve) => {
    fetch(`https://zorapeteri.github.io/prettytransit-gtfs-parser/${city}/transportTypes.json`)
      .then((res) => res.json())
      .then((res) => resolve(Object.values(res).map((x) => (x as any).name.toLowerCase())))
  })
}

const maxLength = Math.max(...cities.map((x) => x.length))
const padPath = (path: string) => path.padEnd(maxLength + 6, ' ')
const padRedirectPath = (path: string) => path.padEnd(maxLength + 18, ' ')

const redirectRecords = [[padPath('/*'), padRedirectPath('/index.html')]]

async function generateIndexHTMLs() {
  if (!fs.existsSync('dist/cities')) {
    fs.mkdirSync('dist/cities')
  }

  for (const city of cities) {
    const cityName = cityNames[city]
    const title = `prettytransit @ ${cityName.toLowerCase()}`
    const transportTypes: any = await getTransportTypes(city)
    const transportTypesReadableList =
      transportTypes.slice(0, -1).join(', ') + ' and ' + transportTypes.at(-1)
    const description = `Timelapse visualization of ${transportTypesReadableList} lines in ${cityName}`
    const seoTagsForCity = makeSeoTags(city, title, description)
    const htmlForCity = htmlContent.replace(seoContent, seoTagsForCity)
    fs.writeFileSync(`dist/cities/${city}.html`, htmlForCity, 'utf8')
    redirectRecords.push([padPath(`/${city}/*`), padRedirectPath(`/cities/${city}.html`)])
  }
}

generateIndexHTMLs().then(() => {
  fs.writeFileSync(
    'dist/_redirects',
    redirectRecords.map((record) => record.join('') + '200').join('\n'),
    'utf8'
  )
})
