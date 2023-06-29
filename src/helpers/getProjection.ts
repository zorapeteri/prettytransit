import * as d3 from 'd3'
import type { FeatureCollection } from 'geojson'
import { endpoint } from './get'

async function getProjection(city: string): Promise<{
  projection: d3.GeoProjection
  cityFeatureCollection: FeatureCollection
}> {
  if (window.projection && window.cityFeatureCollection)
    return { projection: window.projection, cityFeatureCollection: window.cityFeatureCollection }
  const cityFeatureCollection = (await fetch(
    `${endpoint}${city}/cityFeatureCollection.geojson`
  ).then((res) => res.json())) as FeatureCollection
  const width = window.innerWidth
  const height = window.innerHeight
  const projection = d3
    .geoMercator()
    .fitSize([Math.round(width * 0.9), Math.round(height * 0.9)], cityFeatureCollection)
  window.projection = projection
  window.projectionScale = projection.scale()
  return { projection, cityFeatureCollection }
}

export default getProjection
