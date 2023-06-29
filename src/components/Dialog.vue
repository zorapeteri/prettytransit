<script setup lang="ts">
import { ref, watchEffect, type VNodeRef } from 'vue'
import Box from './Box.vue'

const props = defineProps<{
  open: boolean
  class?: string
  uncloseable?: boolean
}>()

const emits = defineEmits<{
  (e: 'onClose'): void
}>()

const dialog = ref<VNodeRef | null>(null)

const onDialogClick = (e: MouseEvent) => {
  if ((e.target as HTMLElement).tagName === 'DIALOG') {
    emits('onClose')
  }
}

const onDialogClose = () => {
  emits('onClose')
}

watchEffect(() => {
  if (props.open) {
    if (props.uncloseable) {
      dialog.value?.show()
    } else {
      dialog.value?.showModal()
    }
  } else if (!props.uncloseable) {
    dialog.value?.close()
  }
})
</script>

<template>
  <dialog ref="dialog" @click="onDialogClick" @close="onDialogClose" :class="props.class">
    <Box>
      <slot></slot>
    </Box>
  </dialog>
</template>

<style scoped lang="scss">
$padding: 2rem;
$maxWidth: 32.125rem;
$rowGap: 1rem;

dialog {
  border: none;
  background-color: transparent;
  outline: none;
  justify-content: center;
  width: 100%;
  max-width: 100%;
  max-height: 100%;

  &[open] {
    display: flex;
  }

  &::backdrop {
    background-color: rgba(0, 0, 0, 0.2);
  }

  .box {
    --padding: #{$padding};
    --max-width: #{$maxWidth};
    --row-gap: #{$rowGap};
    row-gap: var(--row-gap);
    position: relative;
    padding: var(--padding);
    width: 100%;
    min-width: auto;
    max-width: var(--max-width);
    animation-name: fadeIn;

    @media screen and (max-width: 500px) {
      --padding: #{calc($padding / 2)};
    }
  }
}
</style>
