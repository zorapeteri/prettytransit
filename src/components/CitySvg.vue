<script setup lang="ts">
import { type VNodeRef, ref } from 'vue'
import citySvgPaths from '@/constants/citySvgPaths'

defineProps<{ city: keyof typeof citySvgPaths }>()

const path = ref<VNodeRef | null>(null)
</script>

<template>
  <svg
    :class="{ [city]: true }"
    width="250"
    height="250"
    :style="{ '--length': path?.getTotalLength() + 'px' }"
  >
    <path ref="path" :d="citySvgPaths[city]"></path>
    <path :d="citySvgPaths[city]"></path>
    <path :d="citySvgPaths[city]"></path>
  </svg>
</template>
