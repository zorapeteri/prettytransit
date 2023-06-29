<script setup lang="ts">
import { ref } from 'vue'

const smol = window.innerWidth <= 500
const collapsed = ref(smol)

let timeout1: number
let timeout2: number

if (smol) {
  timeout1 = setTimeout(() => (collapsed.value = false), 1000)
  timeout2 = setTimeout(() => (collapsed.value = true), 2000)
}

const onCollapseClick = () => {
  collapsed.value = !collapsed.value
  clearTimeout(timeout1)
  clearTimeout(timeout2)
}

window.addEventListener('resize', () => {
  if (window.innerWidth > 500) {
    collapsed.value = false
    clearTimeout(timeout1)
    clearTimeout(timeout2)
  }
})
</script>

<template>
  <div :class="{ stack: true, collapsed }">
    <button
      id="collapse"
      @click="onCollapseClick"
      :aria-label="collapsed ? 'open' : 'collapse'"
      :style="{
        transform: collapsed ? 'none' : 'rotate(180deg)'
      }"
    />
    <slot></slot>
  </div>
</template>

<style scoped lang="scss">
.stack {
  position: fixed;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: row;
  row-gap: 2rem;
  z-index: 2;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.455, 0.03, 0.515, 0.955);

  button#collapse {
    display: none;
  }

  @media screen and (max-width: 500px) {
    left: 1rem;
    max-height: 500px;

    &.collapsed {
      max-height: 5.5rem;
    }

    button#collapse {
      position: absolute;
      top: 2rem;
      right: 0.6rem;
      display: block;
      border: none;
      background-color: transparent;
      box-shadow: none;
      width: 60px;
      background-image: url(/chevron.svg);
      background-repeat: no-repeat;
      background-size: 40%;
      background-position: center center;

      &:hover,
      &:focus-visible {
        opacity: 0.5;
      }
    }
  }
}
</style>
