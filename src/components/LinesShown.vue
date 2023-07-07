<script setup lang="ts">
import type { LinesCollection, PixiApp, TransportTypes } from '@/types'
import _ from 'lodash'
// @ts-ignore
import colorContrast from 'color-contrast'
import { ref, watchEffect } from 'vue'
import Dialog from './Dialog.vue'
import { cleanupColoredLineTracks, drawColoredLineTracks } from '@/helpers/drawColoredLineTracks'
import { groupLinesByType } from '@/helpers/groupLinesByType'
import { onlyBus } from '@/helpers/onlyBus'
import { endpoint } from '@/helpers/get'
const props = defineProps<{
  city: string
  transportTypes: TransportTypes
  activeLines: string[]
  lines: LinesCollection
  pixi: PixiApp
}>()

const isOnlyBus = onlyBus(props.transportTypes)

const linesGroupedByType = groupLinesByType(Object.keys(props.transportTypes), props.lines)

const emits = defineEmits<{
  (e: 'onActiveLinesChange', lines: string[]): void
}>()

const getActiveLinesDisplay = (_activeLines: string[]) => {
  if (_activeLines.length === 1 && props.transportTypes[_activeLines[0]]) {
    const type = _activeLines[0]
    return {
      [type]: Object.entries(linesGroupedByType[type])
        .map(([name, { colors }]) => ({
          name,
          type,
          colors
        }))
        .sort((a, b) => a.name.length - b.name.length)
    }
  }

  return _.groupBy(
    _activeLines.map((line) => {
      return {
        name: line,
        type: props.transportTypes[line] ? line : props.lines[line].transportType,
        colors: props.transportTypes[line]
          ? props.transportTypes[line].colors
          : props.lines[line].colors
      }
    }),
    'type'
  )
}

const activeLinesDisplay = ref(getActiveLinesDisplay(props.activeLines))

const search = ref('')
const regex = ref(new RegExp('', 'i'))
const activeLineName = ref('')
const dialogOpen = ref(false)

const searchMatchLines = ref<Record<string, string[]>>(
  Object.fromEntries(
    Object.entries(linesGroupedByType).map(([key, value]) => {
      return [key, Object.keys(value)]
    })
  )
)

watchEffect(() => {
  regex.value = new RegExp(search.value, 'i')
  searchMatchLines.value = Object.entries(linesGroupedByType).reduce((acc, [type, lines]) => {
    return {
      ...acc,
      [type]: Object.keys(lines).filter((name) => {
        const { origin, destination } = lines[name]
        return regex.value.test(name) || regex.value.test(origin) || regex.value.test(destination)
      })
    }
  }, {})
})

watchEffect(() => {
  activeLinesDisplay.value = getActiveLinesDisplay(props.activeLines)
})

const showAllLinesOption = (type: string) => {
  if (isOnlyBus) return true
  return type !== 'bus'
}

const onChangeClick = () => {
  dialogOpen.value = true
}

const onDialogClose = () => {
  dialogOpen.value = false
}

const onFormSubmit = (e: Event) => {
  const formData = new FormData(e.target as HTMLFormElement)
  const submitted = Object.keys(Object.fromEntries(formData.entries()))
  const newActiveLines = Object.keys(linesGroupedByType)
    .map((type) => {
      if (submitted.includes(type)) return [type]
      return Object.keys(linesGroupedByType[type]).filter((lineName) =>
        submitted.includes(lineName)
      )
    })
    .flat()
  if (
    newActiveLines.sort().join(',') !== location.pathname.split('/')[2].split(',').sort().join(',')
  ) {
    // lines did actually change
    emits('onActiveLinesChange', newActiveLines)
    cleanupColoredLineTracks()
  }

  ;(document.querySelector('button#collapse') as HTMLElement)?.click()
}

const onTypeCheckboxChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const type = target.name
  document
    .querySelectorAll(`input[type="checkbox"][data-type="${type}"]`)
    .forEach((checkbox) => ((checkbox as HTMLInputElement).checked = target.checked))
}

const onLineCheckboxChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const type = target.getAttribute('data-type')
  const container = document.querySelector('.lines-modal')
  if (!(target && container)) return
  const typeCheckbox = document.querySelector(
    `input[type="checkbox"][name="${type}"]`
  ) as HTMLInputElement

  if (typeCheckbox) {
    typeCheckbox.checked =
      container.querySelectorAll(`input[type="checkbox"][data-type="${type}"]`).length ===
      container.querySelectorAll(`input[type="checkbox"][data-type="${type}"]:checked`).length
  }

  const submitButton = container.querySelector('button[type="submit"]') as HTMLButtonElement
  submitButton.disabled = container.querySelectorAll(`input[type="checkbox"]:checked`).length === 0
}

const onListScroll = () => {
  const border = document.querySelector('.border') as HTMLElement
  if (!border) return
  const borderBounds = border?.getBoundingClientRect()
  const typeLabels = document.querySelectorAll('label[for]')
  for (const label of typeLabels) {
    const labelBounds = label.getBoundingClientRect()
    if (labelBounds.bottom > borderBounds.bottom && labelBounds.top < borderBounds.bottom) {
      border.style.borderBottomColor = (label as HTMLElement).style.color
      border.style.borderBottomWidth = '2px'
      return
    }
    if (labelBounds.top < borderBounds.top && labelBounds.bottom > borderBounds.top) {
      border.style.borderTopColor = (label as HTMLElement).style.color
      border.style.borderTopWidth = '2px'
      return
    }
  }
  border.style.borderBottomColor = 'lightgray'
  border.style.borderBottomWidth = '1px'
  border.style.borderTopColor = 'lightgray'
  border.style.borderTopWidth = '1px'
}

const onLineNameMouseEnter = (e: MouseEvent) => {
  if (activeLineName.value) return
  const name = (e.target as HTMLElement)?.getAttribute('data-name')
  const type = (e.target as HTMLElement)?.getAttribute('data-type')
  if (!(name && type)) return
  if (name !== type) {
    drawColoredLineTracks(linesGroupedByType[type][name], props.pixi)
  }
}

const onLineNameMouseLeave = () => {
  if (!activeLineName.value) {
    cleanupColoredLineTracks()
  }
}

const onLineNameMouseClick = (e: MouseEvent) => {
  cleanupColoredLineTracks()
  const name = (e.target as HTMLElement)?.getAttribute('data-name')
  const type = (e.target as HTMLElement)?.getAttribute('data-type')
  if (!(name && type)) return
  if (name === type) return
  if (name === activeLineName.value) {
    activeLineName.value = ''
  } else {
    activeLineName.value = name
    drawColoredLineTracks(linesGroupedByType[type][name], props.pixi)
  }
}
</script>

<template>
  <div class="lines-shown">
    <span>showing:</span>
    <ul>
      <li v-for="type in Object.keys(activeLinesDisplay)" v-bind:key="type">
        <img :src="`${endpoint}${city}/icons/${type}.png`" :alt="type" />
        <button
          class="lineName"
          v-for="line in activeLinesDisplay[type]"
          :data-name="line.name"
          :data-type="line.type"
          :data-active="line.name === activeLineName"
          @mouseenter="onLineNameMouseEnter"
          @mouseleave="onLineNameMouseLeave"
          @click="onLineNameMouseClick"
          :key="line.name"
          :style="{
            backgroundColor: line.name === activeLineName ? line.colors.fg : line.colors?.bg,
            color: line.name === activeLineName ? line.colors.bg : line.colors?.fg,
            borderColor: line.colors.bg === '#FFFFFF' ? line.colors.fg : line.colors.bg
          }"
        >
          {{
            transportTypes[line.name]
              ? `All ${transportTypes[line.name].name} lines`
              : line.name.split(':')[0]
          }}
        </button>
      </li>
    </ul>
    <button className="changeLinesButton" @click="onChangeClick">Change</button>
  </div>
  <Dialog :open="dialogOpen" class="lines-modal" @onClose="onDialogClose">
    <form method="dialog" @submit="onFormSubmit">
      <input type="text" placeholder="Search" v-model="search" />
      <div class="border"></div>
      <div v-if="dialogOpen" class="list" @scroll="onListScroll">
        <fieldset v-for="type in Object.keys(linesGroupedByType)" :key="type" :id="type">
          <label
            :for="type"
            :style="{
              color:
                colorContrast('#fff', transportTypes[type].colors.bg) > 4.25
                  ? transportTypes[type].colors.bg
                  : '#000',
              display:
                regex.test(transportTypes[type].name) || searchMatchLines[type].length ? '' : 'none'
            }"
          >
            <img :src="`${endpoint}${city}/icons/${type}.png`" :alt="type" />
            <span>{{ transportTypes[type].name }}</span>
          </label>
          <label
            v-if="showAllLinesOption(type) && Object.keys(linesGroupedByType[type]).length > 1"
            :style="{
              display: regex.test(transportTypes[type].name) ? '' : 'none'
            }"
          >
            <input
              type="checkbox"
              :name="type"
              :checked="props.activeLines.includes(type)"
              @change="onTypeCheckboxChange"
            />
            <span
              class="lineName"
              :style="{
                color: transportTypes[type].colors.fg,
                backgroundColor: transportTypes[type].colors.bg,
                borderColor: transportTypes[type].colors.bg
              }"
              >All {{ transportTypes[type].name }} lines</span
            >
          </label>
          <label
            v-for="[lineName, line] in Object.entries(linesGroupedByType[type])"
            :key="lineName"
            :style="{
              display:
                regex.test(transportTypes[type].name) || searchMatchLines[type].includes(lineName)
                  ? ''
                  : 'none'
            }"
          >
            <input
              type="checkbox"
              :name="lineName"
              :checked="props.activeLines.includes(lineName) || props.activeLines.includes(type)"
              :data-type="type"
              @change="onLineCheckboxChange"
            />
            <span
              class="lineName"
              :style="{
                backgroundColor: line.colors?.bg,
                color: line.colors?.fg,
                borderColor: line.colors?.bg === '#FFFFFF' ? line.colors.fg : line.colors.bg
              }"
              >{{ lineName.split(':')[0] }}</span
            >
            <span class="longName" v-if="line.origin && line.destination"
              >{{ line.origin }} - {{ line.destination }}</span
            >
          </label>
        </fieldset>
      </div>
      <button type="submit">OK</button>
    </form>
  </Dialog>
</template>

<style scoped lang="scss">
$lineItemMaxWidth: 20.313rem;
$buttonMaxWidth: 4.375rem;
$linesGap: 0.4rem;
$inputHeight: 2.25rem;
$listHeight: 300px;

.lineName {
  border: none;
  border-radius: 0;
  font-weight: normal;
  line-height: normal;
  font-size: 0.9rem;
  padding: 0 0.175rem;
  border-width: 2px;
  border-style: solid;

  &:hover,
  &:focus-visible {
    opacity: 0.7;
  }
}

.lines-shown {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0.5rem;
  position: relative;

  span {
    font-size: 0.8rem;
  }

  .changeLinesButton {
    font-size: 0.65rem;
    width: 100%;
    max-width: $buttonMaxWidth;
    padding: 0.2rem;
    position: absolute;
    bottom: -0.1rem;
    right: 0;
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    list-style-type: none;
    padding-left: 0;
    margin: 0;

    li {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      max-width: $lineItemMaxWidth;
      gap: $linesGap;

      img {
        height: 1.2rem;
      }

      &:nth-last-child(-n + 2) {
        max-width: calc($lineItemMaxWidth - $buttonMaxWidth - $linesGap);
      }
    }
  }
}

.lines-modal .box {
  --list-max-width: calc(var(--max-width) - (var(--padding) * 2));

  form {
    display: contents;
  }

  input[type='text'] {
    font-size: 16px;
    height: $inputHeight;
  }

  .list {
    width: 100%;
    height: $listHeight;
    max-width: var(--list-max-width);
    overflow-y: scroll;
    border-radius: 5px;
    position: relative;
  }

  .border {
    position: absolute;
    top: calc($inputHeight + var(--row-gap) + var(--padding));
    border: 1px solid lightgray;
    border-radius: 5px;
    width: calc(100% - (var(--padding) * 2));
    height: $listHeight;
    max-width: var(--list-max-width);
  }

  fieldset {
    border: none;
    padding: 0;
    margin: 0;

    & > label {
      display: flex;
      align-items: center;
      padding: 0.6rem;
      gap: 0.5rem;
      border-color: lightgray;
      border-style: solid;
      border-width: 0 0 1px;
      font-size: 0.95rem;

      &:last-child:not(:first-child) {
        border: none;
      }

      img {
        height: 1rem;
      }

      input[type='checkbox'] {
        transform: scale(1.5);
        margin: 0.2rem 0.5rem 0.2rem 0.2rem;
      }

      &:first-child {
        font-weight: 500;
        border: 2px solid currentColor;
        font-size: 1rem;
        position: relative;
      }
    }
  }

  fieldset:first-child label:first-child {
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
  }

  fieldset:last-child label:last-child {
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
  }
}
</style>
