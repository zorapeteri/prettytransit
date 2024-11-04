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
    <meta property="og:url" content="https://prettytransit.zora.pt/${city}" />
    <meta property="og:title" content="${title}" />
    <meta
      property="og:description"
      content="${description}"
    />
    <meta property="og:image" content="https://prettytransit.zora.pt/screenshots/${city}.png" />
    `
}

function isAllUppercase(str: string) {
  return str.split('').every((x) => x === x.toUpperCase())
}

function toLowerCase(str: string) {
  if (isAllUppercase(str)) return str
  return str.toLowerCase()
}

async function getTransportTypes(city: string) {
  return new Promise((resolve) => {
    fetch(`https://zorapeteri.github.io/prettytransit-gtfs-parser/${city}/transportTypes.json`)
      .then((res) => res.json())
      .then((res) => resolve(Object.values(res).map((x) => toLowerCase((x as any).name))))
  })
}

const maxLength = Math.max(...cities.map((x) => x.length))
const padPath = (path: string) => path.padEnd(maxLength + 6, ' ')
const padRedirectPath = (path: string) => path.padEnd(maxLength + 18, ' ')

const redirectRecords = [[padPath('/*'), padRedirectPath('/index.html')]]

async function generateIndexHTMLs() {
  for (const city of cities) {
    const cityName = cityNames[city]
    const title = `${cityName} - prettytransit`
    const transportTypes: any = await getTransportTypes(city)
    const transportTypesReadableList =
      transportTypes.slice(0, -1).join(', ') + ' and ' + transportTypes.at(-1)
    const description = `Timelapse visualization of ${transportTypesReadableList} lines in ${cityName}`
    const seoTagsForCity = makeSeoTags(city, title, description)
    const htmlForCity = htmlContent.replace(seoContent, seoTagsForCity)
    fs.writeFileSync(`dist/${city}.html`, htmlForCity, 'utf8')
    redirectRecords.push([padPath(`/${city}/*`), padRedirectPath(`/${city}.html`)])
  }
}

function addLinksToIndex() {
  const links =
    '<div class="seo-links">\n' +
    cities.map((city) => `      <a href="/${city}">${cityNames[city]}></a>`).join('\n') +
    '\n    </div>'
  const indexHtmlContent = fs.readFileSync('dist/index.html', 'utf8')
  fs.writeFileSync('dist/index.html', indexHtmlContent.replace('<!-- links -->', links), 'utf8')
}

function createSitemap() {
  const sitemapContent = ['', ...cities]
    .map((path) => `https://prettytransit.zora.pt/${path}`)
    .join('\n')
  fs.writeFileSync('dist/sitemap.txt', sitemapContent, 'utf8')
}

createSitemap()
addLinksToIndex()
generateIndexHTMLs().then(() => {
  fs.writeFileSync(
    'dist/_redirects',
    redirectRecords.map((record) => record.join('') + '200').join('\n'),
    'utf8'
  )
})
