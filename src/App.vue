<script setup lang="ts">
import { ref, watchEffect, onMounted, watch } from 'vue'
import type { LinesCollection, PixiApp, Track, TransportType } from './types'
import setupPixi from '@/helpers/setupPixi'
import { drawTracks } from '@/helpers/drawTracks'
import drawCity from '@/helpers/drawCity'
import Loading from '@/components/Loading.vue'
import Time from '@/components/Time.vue'
import Stack from '@/components/Stack.vue'
import Info from '@/components/Info.vue'
import Box from '@/components/Box.vue'
import { setupDepartingTripsEveryHour, setupOngoingTrips } from './helpers/setupTrips'
import { getTrackProjections } from './helpers/getTrackProjections'
import setupLineContainers from '@/helpers/setupLineContainers'
import delay from './helpers/delay'
import getActiveLinesFromUrl from './helpers/getActiveLinesFromUrl'
import { debounce } from 'lodash'
import LinesShown from './components/LinesShown.vue'
import { getCityFromUrl } from './helpers/getCityFromUrl'
import get from './helpers/get'

const city = getCityFromUrl()
const transportTypes = ref<Record<string, TransportType> | null>(null)
const tracks = ref<Track[] | null>(null)
const lines = ref<LinesCollection | null>(null)
const activeTracks = ref<Track[] | null>(null)
const activeLineNames = ref<string[]>([])
const activeLines = ref<LinesCollection | null>()
const pixi = ref<null | PixiApp>(null)
const pixiLoading = ref<string | false>('Getting things ready')
const pixiLoadingForTheFirstTime = ref(true)

const getPixi = () => pixi.value as PixiApp

const getActiveLines = () => {
  if (!(lines.value && activeLineNames.value)) return {}
  return Object.fromEntries(
    Object.entries(lines.value as LinesCollection).filter(([key, { transportType }]) => {
      return activeLineNames.value?.includes(key) || activeLineNames.value?.includes(transportType)
    })
  )
}

const currentTime = ref<number>(new Date().getTime())

const speedSteps = [1, 10, 30, 60, 120, 300, 600, 900, 1800, 3600]
const speed = ref<number>(speedSteps[1])

onMounted(async () => {
  pixi.value = setupPixi()
  pixi.value.ticker.add((delta) => {
    const deltaSeconds = delta / 60
    currentTime.value = currentTime.value + deltaSeconds * 1000
  })
  transportTypes.value = (await get(`${city}/transportTypes`)) as Record<string, TransportType>
  if (!transportTypes.value) return
  lines.value = (
    await Promise.all(Object.keys(transportTypes.value).map((type) => get(`${city}/lines/${type}`)))
  ).reduce((a, b) => ({ ...a, ...b }), {})
  const { activeLinesFromUrl, usedTypes, unusedTypes } = getActiveLinesFromUrl(
    Object.keys(transportTypes.value),
    lines.value as LinesCollection
  )

  tracks.value = (await Promise.all(usedTypes.map((type) => get(`${city}/tracks/${type}`)))).flat()

  activeLineNames.value = activeLinesFromUrl
  activeLines.value = getActiveLines()

  Promise.all(unusedTypes.map((type) => get(`${city}/tracks/${type}`))).then((unusedTracks) => {
    if (tracks.value) {
      tracks.value = [...tracks.value, ...unusedTracks.flat()]
    }
  })

  const width = window.innerWidth
  const height = window.innerHeight
  const app = pixi.value as PixiApp
  function resizeListener() {
    const ratio = Math.min(window.innerWidth / width, window.innerHeight / height)
    app.stage.position.set(window.innerWidth / 2, (window.innerHeight / 2) * 1.05)
    app.stage.scale.set(ratio, ratio)
    app.stage.pivot.set(width / 2, height / 2)
    if (pixiLoading.value === 'Resizing') {
      pixiLoading.value = false
    }
  }

  window.addEventListener('resize', debounce(resizeListener, 1000))
  window.addEventListener('resize', () => {
    if (!pixiLoading.value) pixiLoading.value = 'Resizing'
  })
})

watchEffect(() => {
  if (pixi.value) {
    pixi.value.ticker.speed = speed.value
  }
})

watch(activeLineNames, () => {
  activeLines.value = getActiveLines()
  window.history.replaceState(
    activeLineNames.value.join(','),
    '',
    `/${city}/${activeLineNames.value.join(',')}`
  )
})

watch(activeLineNames, (newActiveLineNames) => {
  if (newActiveLineNames && tracks.value) {
    activeTracks.value = tracks.value.filter(
      (track) =>
        activeLineNames.value!.includes(track.route.transportType) ||
        activeLineNames.value!.includes(track.route.name)
    )
  }
})

watch(activeTracks, async (newTracks) => {
  if (newTracks && pixi.value && tracks.value && lines.value) {
    if (!window.cityFeatureCollection) {
      await drawCity(city, getPixi())
    }

    if (window.lineContainers) {
      Object.values(window.lineContainers).forEach((container) => {
        container.visible = false
      })
      await delay(200)
      Object.values(window.lineContainers).forEach((container) => {
        pixi.value?.stage.removeChild(container)
      })
    }

    await getTrackProjections(city, newTracks)

    const uniquePathTracks: Track[] = newTracks
      .filter((track) => track.uniquePath)
      .sort((a, b) => b.length - a.length)

    pixiLoading.value = 'Drawing tracks'

    await drawTracks(uniquePathTracks, getPixi())

    pixiLoading.value = 'Placing vehicles'

    setupLineContainers(getPixi(), getActiveLines())

    setupOngoingTrips(getPixi(), newTracks, currentTime.value)
    setupDepartingTripsEveryHour(
      getPixi(),
      () => activeTracks.value!,
      () => currentTime.value
    )

    await delay(200)

    pixiLoading.value = 'All done'
    setTimeout(() => {
      pixiLoading.value = false
      pixiLoadingForTheFirstTime.value = false
    }, 200)
  }
})
</script>

<template>
  <div>
    <Stack v-if="!pixiLoadingForTheFirstTime">
      <Box>
        <Time
          :speed="speed"
          :currentTime="currentTime"
          :atLowestSpeed="speed === speedSteps[0]"
          :atHighestSpeed="speed === speedSteps[speedSteps.length - 1]"
          @onSlower="speed = speedSteps[speedSteps.indexOf(speed) - 1]"
          @onFaster="speed = speedSteps[speedSteps.indexOf(speed) + 1]"
        />
        <LinesShown
          v-if="lines && transportTypes && pixi"
          :pixi="(pixi as PixiApp)"
          :city="city"
          :activeLines="activeLineNames"
          :transportTypes="transportTypes"
          :lines="lines"
          @onActiveLinesChange="(lines) => (activeLineNames = lines)"
        />
        <small v-if="Object.keys(activeLines || {}).length * speed > 18000"
          >Performance will likely take a hit at this number of lines and speed. If it's not fun
          anymore, try limiting the number of lines.</small
        >
      </Box>
    </Stack>
    <div id="pixiappcontainer" :class="{ loading: pixiLoading }"></div>
    <Loading :loading="pixiLoading" />
    <Info v-if="!pixiLoading" :city="city" />
  </div>
</template>

<style scoped lang="scss">
#pixiappcontainer {
  position: fixed;
  inset: 0;
  transition: all 0.5s ease-in-out;
}

#pixiappcontainer.loading {
  filter: blur(2.5px);
}

small {
  text-align: center;
  color: gray;
  width: 100%;
  align-self: center;
  font-size: x-small;
  max-width: 300px;

  @media (prefers-contrast: more) {
    color: black;
  }
}
</style>
