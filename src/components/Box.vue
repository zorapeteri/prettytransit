<template>
  <div class="box">
    <slot></slot>
  </div>
</template>
<style scoped lang="scss">
$almostBlack: #212121;

.box {
  padding: 1.5rem 2.5rem;
  min-width: 350px;
  width: fit-content;
  border-radius: 10px;
  background-color: white;
  border: 0.5px solid lighten($almostBlack, 50%);
  box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
  animation: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0s comeIn;
  display: flex;
  flex-direction: column;
  row-gap: 2.5rem;

  @media screen and (max-width: 500px) {
    min-width: auto;
    padding: 1rem;
    width: 100%;
  }
}
</style>
