<script setup lang="ts">
import getFormattedSpeed from '@/helpers/getFormattedSpeed'
import { daysOfTheWeek } from '@/types'
import { format, getDay } from 'date-fns'
const formatTime = (time: number) => format(new Date(time), 'HH:mm:ss')
defineProps<{
  currentTime: number
  speed: number
  atLowestSpeed: boolean
  atHighestSpeed: boolean
}>()

const emits = defineEmits<{
  (e: 'onFaster'): void
  (e: 'onSlower'): void
}>()
</script>
<template>
  <div class="timecontainer">
    <h1>
      {{ formatTime(currentTime) }}
      <small>{{ daysOfTheWeek[getDay(currentTime)] }}</small>
    </h1>
    <div class="timeButtonsContainer">
      <button :disabled="atLowestSpeed" @click="emits('onSlower')" aria-label="slower">
        <span class="buttonText">slower&nbsp;</span>
        <img class="buttonEmoji" src="/emoji/turtle.png" />
        <img class="buttonEmoji animated" src="/emoji/turtle.gif" />
      </button>
      <h5 aria-live="polite">Speed: {{ speed }}x</h5>
      <button :disabled="atHighestSpeed" @click="emits('onFaster')" aria-label="faster">
        <span class="buttonText">faster&nbsp;</span>
        <img class="buttonEmoji" src="/emoji/rocket.png" />
        <img class="buttonEmoji animated" src="/emoji/rocket.gif" />
      </button>
    </div>
    <small>1 second = {{ getFormattedSpeed(speed) }}</small>
  </div>
</template>

<style scoped lang="scss">
.timecontainer {
  display: flex;
  flex-direction: column;
  align-items: center;

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 0;
  }

  .time-and-collapse {
    display: flex;
    width: 100%;

    button {
      display: none;
    }
  }

  h1 {
    font-family: 'Overpass Mono', sans-serif;
    width: 250px;
    text-align: center;
    font-variant-numeric: lining-nums;
    width: 100%;

    small {
      display: block;
      font-weight: normal;
      font-size: small;
    }
  }

  & > * {
    overflow: hidden;
    white-space: nowrap;
  }

  .timeButtonsContainer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 2rem 0 1rem 0rem;

    button {
      font-weight: 500;
      font-size: 0.95rem;
      display: flex;
      width: 110px;
      justify-content: center;
      align-items: center;
      transition: all 0.3s cubic-bezier(0.455, 0.03, 0.515, 0.955);

      .buttonText {
        max-width: 0px;
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.455, 0.03, 0.515, 0.955);
      }

      .buttonEmoji {
        margin: 0;
        height: 1.65rem;

        &.animated {
          display: none;
        }
      }

      &:hover,
      &:focus-visible {
        .buttonText {
          max-width: 100%;
        }

        .buttonEmoji {
          display: none;

          &.animated {
            display: block;
          }
        }
      }
    }

    h5 {
      width: 120px;
      text-align: center;
    }
  }

  @media screen and (max-width: 500px) {
    .timeButtonsContainer {
      justify-content: space-between;
      width: 100%;
      gap: 1rem;

      button {
        width: 100%;
        font-size: 1rem;
        padding: 0.5rem;

        .buttonEmoji {
          height: 1.4rem;
        }

        &:hover,
        &:focus-visible {
          .buttonText {
            max-width: 0px;
          }
        }
      }
    }

    h1 {
      text-align: start;
    }
  }
}
</style>
