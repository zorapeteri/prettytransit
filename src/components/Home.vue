<script setup lang="ts">
import { onMounted, ref } from 'vue'
import cities from '@/constants/cities'
import CitySvg from './CitySvg.vue'
import { cityNames } from '@/constants/cityNames'
import get, { endpoint } from '@/helpers/get'
import { cityCountries } from '@/constants/cityCountries'

const transportTypes = ref<Record<string, string[]> | null>({})
const citySvgPaths = ref<any>({})

onMounted(async () => {
  for (const city of cities) {
    const svgPathForCity = await (await fetch(`${endpoint}${city}/citySvgPath.txt`)).text()
    const transportTypesForCity = Object.keys(await get(`${city}/transportTypes`))
    citySvgPaths.value = { ...citySvgPaths.value, [city]: svgPathForCity }
    transportTypes.value = { ...transportTypes.value, [city]: transportTypesForCity }
  }
})
</script>

<template>
  <div class="home-container">
    <header>
      <img src="/icon.png" alt="pretty transit logo" />
      <h1>prettytransit</h1>
    </header>
    <main>
      <a v-for="city in cities" :key="city" button :href="'/' + city" :title="cityNames[city]">
        <div>
          <strong>{{ cityNames[city] }}</strong
          ><img :src="`/emoji/countries/${cityCountries[city]}.png`" :alt="cityCountries[city]" />
        </div>
        <CitySvg :city="city" :citySvgPaths="citySvgPaths" />
        <ul v-if="transportTypes">
          <li v-for="type in transportTypes[city]" :key="type">
            <img :src="`${endpoint}${city}/icons/${type}.png`" :alt="type" />
          </li>
        </ul>
      </a>
    </main>
    <footer>
      <span>made with ♡ by <a href="https://zora.rocks" target="_blank">zora</a></span
      ><span> | </span
      ><a href="https://github.com/zorapeteri/prettytransit" target="_blank">github</a>
    </footer>
  </div>
</template>

<style lang="scss">
.home-container {
  width: 100%;
  height: 100%;
  position: relative;
  padding: 4rem 2rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;

  header {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 2rem;

    img {
      height: 5rem;
    }
  }

  main {
    display: flex;
    justify-content: center;
    gap: 2rem;
    flex-wrap: wrap;
    width: 100%;

    a {
      width: 100%;
      max-width: 320px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      padding: 1.5rem;
      gap: 2rem;
      color: inherit;
      text-decoration: none;

      & > div {
        display: flex;
        justify-content: space-between;
        align-items: center;

        img {
          height: 1rem;
          opacity: 0.9;
        }

        strong {
          font-size: 1.1rem;
          text-align: start;
          font-weight: 500;
        }
      }

      svg {
        &.berlin,
        &.budapest {
          transform: scale(0.9) translateX(30px);
        }

        &.potsdam,
        &.vienna,
        &.szombathely,
        &.brighton,
        &.london,
        &.dublin {
          transform: scale(0.9) translateX(15px);
        }

        &.zalaegerszeg,
        &.sopron,
        &.gyor,
        &.keszthely,
        &.siofok,
        &.pecs,
        &.miskolc,
        &.bratislava,
        &.belgrade {
          transform: scale(0.9) translateX(15px) translateY(15px);
        }

        path {
          stroke: #c7c7c7;
          stroke-width: 1.5px;
          fill: none;

          &:nth-child(2) {
            stroke: darken(lavender, 15%);
            stroke-width: 2px;
            stroke-dasharray: calc(var(--length) / 10) 10000000px;
            animation-name: roundAndRound;
            animation-iteration-count: infinite;
            animation-timing-function: linear;
            animation-duration: 5s;
          }

          &:nth-child(3) {
            stroke: darken(lavender, 15%);
            stroke-width: 2px;
            stroke-dasharray: 0px 10000000px;
            animation-name: inTheEnd;
            animation-timing-function: linear;
            animation-iteration-count: infinite;
            animation-duration: 5s;
          }
        }
      }

      ul {
        display: flex;
        list-style-type: none;
        padding: 0;
        gap: 0.5rem;
        margin: 0;
        opacity: 0.9;

        li {
          display: flex;
          align-items: center;
        }

        img {
          height: 1rem;
        }
      }
    }
  }

  footer {
    margin: auto;
    padding: 0 0 0.5rem;
    width: 100%;
    display: flex;
    justify-content: center;
    gap: 0.3rem;
    font-size: small;

    a {
      color: inherit;
      transition: all 0.2s linear;

      &:hover,
      &:focus-visible {
        color: black;
      }
    }

    @media (prefers-contrast: no-preference) {
      color: gray;
      opacity: 0.9;
    }
  }
}

@keyframes roundAndRound {
  from {
    stroke-dashoffset: 0;
  }

  to {
    stroke-dashoffset: calc(var(--length) * -1);
  }
}

@keyframes inTheEnd {
  0% {
    stroke-dasharray: 0px 100000000px;
  }
  90% {
    stroke-dasharray: 0px 100000000px;
  }

  100% {
    stroke-dasharray: 100px 1000000px;
  }
}
</style>
