<script setup lang="ts">
const props = defineProps<{
  loading: string | false
}>()
</script>
<template>
  <div class="loadingmessagecontainer" v-if="props.loading">
    <span class="loadingMessage" :data-value="props.loading">{{ props.loading }}</span>
  </div>
</template>

<style scoped lang="scss">
.loadingmessagecontainer {
  --font-size: 3rem;
  position: fixed;
  inset: 0;
  z-index: 3;
  display: grid;
  place-items: center;
  filter: blur(1px);
  background-color: rgba(0, 0, 0, 0.1);

  span {
    font-weight: bold;
    font-size: var(--font-size);
  }

  .loadingMessage {
    color: black;
    position: relative;

    &:before {
      content: attr(data-value);
      position: absolute;
      inset: 0;
      width: 100%;
      z-index: 4;
      color: gray;
      white-space: nowrap;
      overflow: hidden;
      max-width: 0%;
      animation: 0.8s ease-in-out 0s infinite alternate maxWidth;
    }
  }

  @media screen and (max-width: 500px) {
    --font-size: 2rem;
  }
}

@keyframes maxWidth {
  from {
    max-width: 0%;
  }

  to {
    max-width: 100%;
  }
}
</style>
