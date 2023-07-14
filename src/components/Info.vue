<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Dialog from './Dialog.vue'
// @ts-ignore no types:((
import VueMarkdown from 'vue-markdown-render'
import { endpoint } from '@/helpers/get'

const props = defineProps<{
  city: string
}>()

const markdown = ref<string>('')
const dialogOpen = ref(false)

const onClick = () => {
  dialogOpen.value = true
}

const onDialogClose = () => {
  dialogOpen.value = false
}

onMounted(() => {
  fetch(`${endpoint}${props.city}/info.md`)
    .then((res) => res.text())
    .then((text) => (markdown.value = text))
})
</script>

<template>
  <button class="info-button" title="info" @click="onClick">
    <img src="/info.svg" />
  </button>
  <Dialog :open="dialogOpen" @onClose="onDialogClose">
    <vue-markdown :source="markdown" />
  </Dialog>
</template>

<style scoped lang="scss">
.info-button {
  padding: 0.1rem;
  border-radius: 50%;
  position: fixed;
  width: 2rem;
  bottom: 1rem;
  left: 1rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    height: 1rem;
    opacity: 0.75;
  }
}
</style>
