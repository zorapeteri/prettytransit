<script setup lang="ts">
import App from './App.vue'
import ErrorFallback from './components/ErrorFallback.vue'
import { onMounted, ref } from 'vue'

const hadError = ref(false)

onMounted(() => {
  const onerror = () => {
    hadError.value = true
    document.querySelector('.app-wrapper')?.remove()
  }
  window.onerror = onerror
  window.onunhandledrejection = onerror
})
</script>

<template>
  <ErrorFallback v-if="hadError" />
  <div class="app-wrapper" v-if="!hadError" :style="{ display: 'contents' }">
    <App />
  </div>
</template>
