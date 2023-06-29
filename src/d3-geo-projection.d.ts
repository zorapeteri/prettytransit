declare module 'd3-geo-projection' {
  import * as d3geo from 'd3-geo-projection'
  import type { Feature, LineString } from 'geojson'

  export const geoProject: (feature: Feature, projection: d3.GeoProjection) => Feature<LineString>
}
