<script setup lang="ts">
import Dialog from './Dialog.vue'
</script>

<template>
  <div class="error-container">
    <Dialog open uncloseable>
      <img src="/oops.png" alt="drawing of bus with 'oops' as headsign" />
      <h1>Something went wrong.</h1>
      <a button href="/">Go home</a>
    </Dialog>
  </div>
</template>

<style lang="scss">
.error-container {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;

  dialog .box {
    align-items: center;

    img {
      height: 7rem;
    }

    h1 {
      font-size: 1.4rem;
    }
  }
}
</style>
